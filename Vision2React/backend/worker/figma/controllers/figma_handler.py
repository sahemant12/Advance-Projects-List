import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from io import BytesIO
from pathlib import Path

import boto3
import requests
from dotenv import load_dotenv
from toon_format import encode

from exports.prisma.client import prisma
from exports.redis.queue import SECTIONS_QUEUE, enqueue
from worker.figma.services.export_detector import detect_export_children
from worker.figma.services.export_handler import export_nodes_to_images
from worker.figma.services.figma_client import (FigmaClient, extract_sections,
                                                filter_figma_data, filter_node)

load_dotenv()


async def handle_figma_data(node: dict):
    payload = node.get("payload", {})
    file_key = payload.get("file_key")
    user_id = payload.get("user_id")

    if not file_key:
        return {"status": "error", "message": "file_key required"}
    if not user_id:
        return {"status": "error", "message": "user_id required"}

    try:
        # Get user's Figma token from database
        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or not user.figmaToken:
            return {"status": "error", "message": "User Figma token not found"}

        # Create FigmaClient with user's token
        client = FigmaClient(token=user.figmaToken)

        # Getting raw Figma data
        data = client._get_file(file_key)

        # Filtering data without exports first (to extract sections)
        filtered_data = filter_figma_data(data)
        sections = extract_sections(filtered_data)
        canvas = filtered_data.get("document", {}).get("children", [{}])[0]
        main_frame = next(
            (
                child
                for child in canvas.get("children", [])
                if child.get("type") == "FRAME"
            ),
            None,
        )
        if main_frame and "children" in main_frame:
            main_frame["children"].reverse()

        temp_path = payload.get("saved_path", f"data/figma/{file_key}.json")
        _save_json(filtered_data, temp_path)

        full_design_node_id = main_frame.get("id") if main_frame else None
        screenshot_urls = None
        if full_design_node_id:
            screenshot_urls = process_screenshots(
                client, file_key, sections, full_design_node_id
            )
        all_image_urls = client._get_image_urls(file_key)

        def process_single_section(idx, section):
            section_name = section["name"]
            section_dir = f"data/figma/{file_key}/sections/{section_name}"
            section_path = f"{section_dir}/section.json"

            # Running export detection on THIS section only
            section_export_map = detect_export_children(section["data"], {})
            print(f"Section '{section_name}': Found {len(section_export_map)} nodes to export")
            section_export_results = {}
            if section_export_map and client.token:
                section_export_results = export_nodes_to_images(
                    file_key=file_key,
                    export_map=section_export_map,
                    figma_token=client.token,
                    scale=2
                )
                print(f"Section '{section_name}': Exported {len(section_export_results)} nodes")

            # Applying export results to section data
            section_data = filter_node(section["data"], section_export_results)

            # Reverse children for top-to-bottom order
            if isinstance(section_data, dict) and "children" in section_data:
                section_data["children"] = list(reversed(section_data["children"]))

            # _save_section_with_toon(section_data, Path(section_path))
            _save_json(section_data, section_path)
            section_images = download_section_images(
                file_key, section["id"], section["data"], all_image_urls
            )
            img_path = None
            if section_images:
                section_images = modify_url(file_key, section_images)
                img_path = f"{section_dir}/image.json"
                _save_json(section_images, img_path)
            section_screenshot_url = None
            if screenshot_urls and section_name in screenshot_urls["sections"]:
                section_screenshot_url = screenshot_urls["sections"][section_name]
            return {
                "section_path": section_path,
                "section_name": section_name,
                "section_index": idx,
                "img_path": img_path,
                "section_screenshot_url": section_screenshot_url,
                "section_images": section_images,
                "section_id": section["id"],
            }

        total_sections_count = len(sections)
        section_files = []
        with ThreadPoolExecutor(max_workers=total_sections_count) as executor:
            futures = [
                executor.submit(process_single_section, idx, section)
                for idx, section in enumerate(sections)
            ]
            for future in as_completed(futures):
                result = future.result()
                section_files.append(result["section_path"])
                enqueue(
                    {
                        "type": "process_section",
                        "file_key": file_key,
                        "section_id": result["section_id"],
                        "section_name": result["section_name"],
                        "section_index": result["section_index"],
                        "section_data_path": result["section_path"],
                        "section_images_path": result["img_path"],
                        "section_screenshot_url": result["section_screenshot_url"],
                        "image_count": (
                            len(result["section_images"])
                            if result["section_images"]
                            else 0
                        ),
                        "total_sections": total_sections_count,
                        "full_design_screenshot_url": (
                            screenshot_urls["full_design"] if screenshot_urls else None
                        ),
                    },
                    queue_name=SECTIONS_QUEUE,
                )
        return {
            "status": "success",
            "file_key": file_key,
            "saved_to": temp_path,
            "section_files": section_files,
            "full_design_screenshot_url": (
                screenshot_urls["full_design"] if screenshot_urls else None
            ),
            "section_queued": len(sections),
            "section_names": [s["name"] for s in sections],
        }
    except Exception as e:
        return {"status": "error", "message": {str(e)}, "file_key": file_key}


def _save_json(data: dict, path: str):
    file_path = Path(path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)


def get_image_extension(response):
    content_type = response.headers.get("Content-Type", "image/png")
    type_map = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/svg+xml": "svg",
    }
    return type_map.get(content_type, "png")


def save_screenshot(screenshot_url: str, save_path: str, section_name: str | None = None):
    response = requests.get(screenshot_url)
    response.raise_for_status()
    extension = get_image_extension(response)
    save_path = f"{save_path}.{extension}"
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(response.content)
    identifier = section_name if section_name else "full_design"
    print(f"Screenshot saved for {section_name}: {save_path}")
    return (identifier, save_path)


def extract_image_refs(section_data, refs=None, seen=None):
    if refs is None:
        refs = []
    if seen is None:
        seen = set()
    if isinstance(section_data, dict):
        if "fills" in section_data and isinstance(section_data["fills"], list):
            for fill in section_data["fills"]:
                if isinstance(fill, dict) and "imageRef" in fill:
                    image_ref = fill["imageRef"]
                    if image_ref not in seen:
                        seen.add(image_ref)
                        refs.append(image_ref)
        for value in section_data.values():
            extract_image_refs(value, refs, seen)
    elif isinstance(section_data, list):
        for item in section_data:
            extract_image_refs(item, refs, seen)
    return refs


def download_section_images(
    file_key: str, section_id: str, section_data: dict, all_image_urls: dict
):
    section_refs = extract_image_refs(section_data)
    print(f"Section {section_id}: Found {len(section_refs)} refs: {section_refs}")
    if not section_refs:
        return {}
    section_images = {}
    for ref in section_refs:
        if ref in all_image_urls:
            section_images[ref] = {
                "imageRef": ref,
                "figmaUrl": all_image_urls[ref],
            }
        else:
            print(f"No match for ref {ref}")
    return section_images


def upload_image_to_r2(image_url: str, image_ref: str, file_key: str):
    account_id = os.getenv("ACCOUNT_ID")
    access_key_id = os.getenv("ACCESS_KEY_ID")
    secret_access_key = os.getenv("SECRET_ACCESS_KEY")
    public_domain = os.getenv("R2_PUBLIC_DOMAIN")
    bucket_name = os.getenv("R2_BUCKET_NAME")

    response = requests.get(image_url)
    response.raise_for_status()
    image_data = BytesIO(response.content)

    content_type = response.headers.get("Content-Type", "image/png")
    extension = content_type.split("/")[-1]

    r2_key = f"{file_key}/images/{image_ref}.{extension}"

    r2 = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name="auto",
    )

    r2.put_object(
        Bucket=bucket_name,
        Key=r2_key,
        Body=image_data.getvalue(),
        ContentType=content_type,
    )
    cloud_url = f"{public_domain}/{r2_key}"
    return cloud_url


def upload_screenshot_to_r2(local_path: str, file_key: str, identifier: str):
    account_id = os.getenv("ACCOUNT_ID")
    access_key_id = os.getenv("ACCESS_KEY_ID")
    secret_access_key = os.getenv("SECRET_ACCESS_KEY")
    public_domain = os.getenv("R2_PUBLIC_DOMAIN")
    bucket_name = os.getenv("R2_BUCKET_NAME")

    with open(local_path, "rb") as f:
        image_data = f.read()

    extension = Path(local_path).suffix[1:]
    if identifier == "full_design":
        r2_key = f"{file_key}/screenshots/full_design.{extension}"
    else:
        r2_key = f"{file_key}/screenshots/{identifier}.{extension}"

    r2 = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name="auto",
    )
    content_type = f"image/{extension}"
    r2.put_object(
        Bucket=bucket_name, Key=r2_key, Body=image_data, ContentType=content_type
    )
    cloud_url = f"{public_domain}/{r2_key}"
    print(f"Uploaded screenshot to R2: {cloud_url}")
    return cloud_url


def process_screenshots(
    client: FigmaClient, file_key: str, sections: list, full_design_node_id: str
):
    """
    Downloads screenshots from Figma, uploads to R2, returns cloud URLs.
    """
    screenshot_urls = {"full_design": None, "sections": {}}
    all_node_ids = [full_design_node_id] + [section["id"] for section in sections]
    figma_screenshots = client._get_node_screenshots(file_key, all_node_ids)
    download_tasks = []
    if full_design_node_id in figma_screenshots:
        figma_screenshot_url = figma_screenshots[full_design_node_id]
        local_save_path = f"data/figma/{file_key}/full_design_screenshot"
        download_tasks.append(
            (save_screenshot, figma_screenshot_url, local_save_path, None)
        )
    for section in sections:
        section_id = section["id"]
        section_name = section["name"]
        if section_id in figma_screenshots:
            figma_screenshot_url = figma_screenshots[section_id]
            local_save_path = (
                f"data/figma/{file_key}/sections/{section_name}/screenshot"
            )
            download_tasks.append(
                (save_screenshot, figma_screenshot_url, local_save_path, section_name)
            )
    num_workers = len(download_tasks) + 1
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = [
            executor.submit(func, url, path, name)
            for func, url, path, name in download_tasks
        ]
        for future in as_completed(futures):
            identifier, local_saved_path = future.result()
            if local_saved_path:
                cloud_url = upload_screenshot_to_r2(
                    local_saved_path, file_key, identifier
                )
                if identifier == "full_design":
                    screenshot_urls["full_design"] = cloud_url
                else:
                    screenshot_urls["sections"][identifier] = cloud_url
    return screenshot_urls


def modify_url(file_key: str, section_images: dict):
    if not section_images:
        return {}
    updated_images = {}

    def single_image(image_ref, image_data):
        figma_url = image_data["figmaUrl"]
        try:
            cloud_url = upload_image_to_r2(figma_url, image_ref, file_key)
            print(f"Uploaded {image_ref} to R2: {cloud_url}")
            return (
                image_ref,
                {
                    "imageRef": image_ref,
                    "figmaUrl": figma_url,
                    "cloudUrl": cloud_url,
                },
            )
        except Exception as e:
            print(f"Failed to upload {image_ref}: {e}")
            return (image_ref, image_data)

    num_workers = len(section_images)
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = [
            executor.submit(single_image, img_ref, img_data)
            for img_ref, img_data in section_images.items()
        ]
        for future in as_completed(futures):
            image_ref, image_data = future.result()
            updated_images[image_ref] = image_data

    return updated_images

# def _save_section_with_toon(section_data: dict, section_path: Path):
#     with open(section_path, 'w') as f:
#         json.dump(section_data, f, indent=2)
#     toon_path = section_path.parent / "section.toon"
#     toon_output = encode(section_data, {
#         "delimiter": "\t",
#         "indent": 2
#     })
#     with open(toon_path, 'w') as f:
#         f.write(toon_output)
#     print(f"Saved Both Formats: {section_path.name} & section.toon")
