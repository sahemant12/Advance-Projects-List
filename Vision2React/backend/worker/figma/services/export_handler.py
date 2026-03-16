import os
from io import BytesIO
from pathlib import Path
from typing import Dict, List

import boto3
import requests
from dotenv import load_dotenv

from worker.figma.services.export_detector import get_export_format

load_dotenv()


def export_nodes_to_images(
    file_key: str,
    export_map: Dict[str, Dict],
    figma_token: str,
    scale: int = 2,
):
    """
    Exports nodes based on their complexity:
    - Simple icons (≤3 vectors): Download SVG content, embed in results
    - Complex graphics (>3 vectors): Export as PNG to R2

    Returns mapping of node_id -> export info
    """
    if not export_map:
        return {}
    nodes_to_embed = []  # Will download SVG content
    nodes_to_export_png = []  # Will export as PNG to R2
    node_format_map = {}  # Track which format each node needs

    for parent_id, export_info in export_map.items():
        strategy = export_info.get("strategy")
        node = export_info.get("node")

        if not node:
            continue

        if strategy == "EXPORT_FRAME":
            # Entire frame to export
            export_format = get_export_format(node)
            node_format_map[parent_id] = export_format

            if export_format == "EMBED_SVG":
                nodes_to_embed.append(parent_id)
            elif export_format == "EXPORT_PNG":
                nodes_to_export_png.append(parent_id)

        elif strategy == "EXPORT_CHILDREN":
            # Individual children to export
            children_ids = export_info.get("children_to_export", [])
            children = node.get("children", [])

            for child in children:
                if not isinstance(child, dict):
                    continue
                child_id = child.get("id")
                if child_id in children_ids:
                    export_format = get_export_format(child)
                    node_format_map[child_id] = export_format

                    if export_format == "EMBED_SVG":
                        nodes_to_embed.append(child_id)
                    elif export_format == "EXPORT_PNG":
                        nodes_to_export_png.append(child_id)

    export_results = {}

    # Process EMBED_SVG nodes (download SVG content)
    if nodes_to_embed:
        svg_contents = _download_svg_contents(file_key, nodes_to_embed, figma_token, scale)
        for node_id, svg_content in svg_contents.items():
            export_results[node_id] = {
                "strategy": "EMBED_SVG",
                "svgContent": svg_content,
                "format": "svg"
            }
            print(f"Embedded SVG for node {node_id}")

    # Process EXPORT_PNG nodes (upload to R2)
    if nodes_to_export_png:
        png_urls = _export_as_png_to_r2(file_key, nodes_to_export_png, figma_token, scale)
        for node_id, cloud_url in png_urls.items():
            export_results[node_id] = {
                "strategy": "EXPORT_PNG",
                "cloudUrl": cloud_url,
                "format": "png"
            }
            print(f"Exported PNG for node {node_id}: {cloud_url}")

    return export_results


def _get_figma_export_urls(
    file_key, node_ids: List[str], figma_token: str, format: str = "svg", scale: int = 1
):
    ids_param = ",".join(node_ids)
    url = f"https://api.figma.com/v1/images/{file_key}"
    params = {"ids": ids_param, "format": format, "scale": scale}
    headers = {"X-Figma-Token": figma_token}
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    data = response.json()
    return data.get("images", {})


def _upload_export_to_r2(figma_url: str, file_key: str, node_id: str, format: str):
    account_id = os.getenv("ACCOUNT_ID")
    access_key_id = os.getenv("ACCESS_KEY_ID")
    secret_access_key = os.getenv("SECRET_ACCESS_KEY")
    public_domain = os.getenv("R2_PUBLIC_DOMAIN")
    bucket_name = os.getenv("R2_BUCKET_NAME")

    response = requests.get(figma_url)
    response.raise_for_status()
    image_data = BytesIO(response.content)
    r2_key = f"{file_key}/exports/{node_id}.{format}"

    r2 = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name="auto",
    )
    content_type = f"image/{format}"
    if format == "svg":
        content_type = "image/svg+xml"
    r2.put_object(
        Bucket=bucket_name,
        Key=r2_key,
        Body=image_data.getvalue(),
        ContentType=content_type,
    )
    cloud_url = f"{public_domain}/{r2_key}"
    return cloud_url


def _download_svg_contents(
    file_key: str,
    node_ids: List[str],
    figma_token: str,
    scale: int = 2
) -> Dict[str, str]:
    """
    Downloads SVG content from Figma for embedding in JSON.
    Returns mapping of node_id -> SVG string
    """
    # Get Figma export URLs
    figma_urls = _get_figma_export_urls(file_key, node_ids, figma_token, format="svg", scale=scale)

    svg_contents = {}
    for node_id, figma_url in figma_urls.items():
        try:
            response = requests.get(figma_url)
            response.raise_for_status()
            svg_content = response.text
            svg_contents[node_id] = svg_content
        except Exception as e:
            print(f"Failed to download SVG for {node_id}: {e}")

    return svg_contents


def _export_as_png_to_r2(
    file_key: str,
    node_ids: List[str],
    figma_token: str,
    scale: int = 2
) -> Dict[str, str]:
    """
    Exports nodes as PNG and uploads to R2.
    Returns mapping of node_id -> R2 cloud URL
    """
    # Get Figma export URLs
    figma_urls = _get_figma_export_urls(file_key, node_ids, figma_token, format="png", scale=scale)

    cloud_urls = {}
    for node_id, figma_url in figma_urls.items():
        try:
            cloud_url = _upload_export_to_r2(figma_url, file_key, node_id, format="png")
            cloud_urls[node_id] = cloud_url
        except Exception as e:
            print(f"Failed to export PNG for {node_id}: {e}")

    return cloud_urls
