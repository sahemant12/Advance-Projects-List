import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

import httpx
import requests
from dotenv import load_dotenv

load_dotenv()


class FigmaClient:
    BASE_URL = "https://api.figma.com/v1"

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("FIGMA_TOKEN")
        if not self.token:
            raise ValueError("FIGMA TOKEN NOT FOUND")

    def _get_file(self, file_key: str, timeout: int = 30):
        url = f"{self.BASE_URL}/files/{file_key}"
        headers = {"X-Figma-Token": self.token}
        response = httpx.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response.json()

    def _get_image_urls(self, file_key: str):
        url = f"{self.BASE_URL}/files/{file_key}/images"
        headers = {"X-Figma-Token": self.token}
        response = httpx.get(url, headers=headers)
        response.raise_for_status()
        return response.json().get("meta", {}).get("images", {})

    def _get_node_screenshots(
        self,
        file_key: str,
        node_ids: list,
        batch_size: int = 3,
        scale: int = 2,
        format: str = "png",
    ):
        batches = [
            node_ids[i : i + batch_size] for i in range(0, len(node_ids), batch_size)
        ]
        all_screenshots = {}

        def fetch_batch(batch):
            ids_param = ",".join(batch)
            url = f"https://api.figma.com/v1/images/{file_key}"
            params = {"ids": ids_param, "format": format, "scale": scale}
            headers = {"X-Figma-Token": self.token}
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("images", {})

        with ThreadPoolExecutor(max_workers=len(batches)) as executor:
            futures = [executor.submit(fetch_batch, batch) for batch in batches]
            for future in as_completed(futures):
                batch_results = future.result()
                all_screenshots.update(batch_results)

        return all_screenshots


def filter_node(node, export_results=None):
    if not isinstance(node, dict):
        return node

    node_id = node.get("id")

    # Checks if this node was exported - replaces it with placeholder
    if export_results and node_id in export_results:
        export_info = export_results[node_id]
        strategy = export_info.get("strategy")

        if strategy == "EMBED_SVG":
            # Returns EMBEDDED_SVG placeholder with SVG content
            return {
                "type": "EMBEDDED_SVG",
                "id": node_id,
                "name": node.get("name"),
                "svgContent": export_info.get("svgContent"),
                "format": "svg",
                "absoluteBoundingBox": node.get("absoluteBoundingBox")
            }
        elif strategy == "EXPORT_PNG":
            # Returns EXPORTED_IMAGE placeholder with R2 URL
            return {
                "type": "EXPORTED_IMAGE",
                "id": node_id,
                "name": node.get("name"),
                "cloudUrl": export_info.get("cloudUrl"),
                "format": "png",
                "absoluteBoundingBox": node.get("absoluteBoundingBox")
            }

    essentials = {
        "id",
        "name",
        "type",
        "visible",
        "children",
        "absoluteBoundingBox",
        "x",
        "y",
        "width",
        "height",
        "constraints",
        "layoutMode",
        "layoutAlign",
        "layoutGrow",
        "primaryAxisAlignItems",
        "counterAxisAlignItems",
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "itemSpacing",
        "fills",
        "strokes",
        "strokeWeight",
        "cornerRadius",
        "opacity",
        "effects",
        "characters",
        "style",
        "componentId",
        "componentProperties",
        "imageRef",
        "scaleMode",
    }
    filtered_attributes = {}
    for key, value in node.items():
        if key in essentials:
            if key == "children" and isinstance(value, list):
                filtered_attributes[key] = [filter_node(child, export_results) for child in value]
            else:
                filtered_attributes[key] = value
    return filtered_attributes


def filter_figma_data(data, export_results=None):
    return {
        "name": data.get("name"),
        "document": filter_node(data.get("document", {}), export_results),
    }


def extract_sections(figma_data, main_frame_name=None):
    """Extracting sections from the main design frame"""
    document = figma_data.get("document", {})
    canvas = next(
        (
            child
            for child in document.get("children", [])
            if child.get("type") == "CANVAS"
        ),
        None,
    )
    if not canvas:
        return []

    if main_frame_name:
        main_frame = next(
            (
                child
                for child in canvas.get("children", [])
                if child.get("type") == "FRAME" and child.get("name") == main_frame_name
            ),
            None,
        )
    else:
        main_frame = next(
            (
                child
                for child in canvas.get("children", [])
                if child.get("type") == "FRAME"
            ),
            None,
        )
    if not main_frame:
        return []

    sections = []
    for idx, section in enumerate(main_frame.get("children", [])):
        if section.get("type") == "FRAME":
            sections.append(
                {
                    "id": section.get("id"),
                    "name": section.get("name"),
                    "type": section.get("type"),
                    "data": section,
                }
            )
    sections.reverse()
    for idx, section in enumerate(sections):
        section["order"] = idx
    return sections
