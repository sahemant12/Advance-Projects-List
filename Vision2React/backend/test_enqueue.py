"""
Test script to enqueue sections with R2 URLs (assuming screenshots are already in R2).
This mimics what the Figma worker does.
"""
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from exports.redis.queue import SECTIONS_QUEUE, enqueue

load_dotenv()

DATA_DIR = Path(__file__).parent / "data" / "figma"
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN")

def test_enqueue_with_r2_urls(file_key: str):
    """Enqueue sections with R2 URLs constructed from file_key and section names."""

    sections_dir = DATA_DIR / file_key / "sections"
    if not sections_dir.exists():
        print(f"❌ Sections directory not found: {sections_dir}")
        return

    sections = []
    for section_dir in sorted(sections_dir.iterdir()):
        if not section_dir.is_dir() or section_dir.name.startswith('.'):
            continue

        section_json_path = section_dir / "section.json"
        if not section_json_path.exists():
            continue

        with open(section_json_path, 'r') as f:
            section_data = json.load(f)

        section_name = section_data.get("name", section_dir.name)
        section_id = section_data.get("id")

        # Check for image.json
        image_json_path = section_dir / "image.json"
        img_path = str(image_json_path) if image_json_path.exists() else None

        image_count = 0
        if img_path:
            with open(image_json_path, 'r') as f:
                images = json.load(f)
                image_count = len(images) if isinstance(images, dict) else 0

        # Find screenshot file
        screenshot_files = list(section_dir.glob("screenshot.*"))
        section_screenshot_ext = screenshot_files[0].suffix[1:] if screenshot_files else "png"

        sections.append({
            "section_id": section_id,
            "section_name": section_name,
            "section_data_path": str(section_json_path),
            "section_images_path": img_path,
            "section_screenshot_ext": section_screenshot_ext,
            "image_count": image_count,
        })

    if not sections:
        print(f"❌ No sections found")
        return

    # Construct full design screenshot R2 URL
    full_design_files = list((DATA_DIR / file_key).glob("full_design_screenshot.*"))
    full_design_ext = full_design_files[0].suffix[1:] if full_design_files else "png"
    full_design_screenshot_url = f"{R2_PUBLIC_DOMAIN}/{file_key}/screenshots/full_design.{full_design_ext}"

    total_sections = len(sections)
    print(f"\n📁 Enqueueing {total_sections} sections for {file_key}")
    print(f"📸 Full design URL: {full_design_screenshot_url}\n")

    for idx, section in enumerate(sections):
        # Construct section screenshot R2 URL (matching Figma worker pattern)
        section_screenshot_url = f"{R2_PUBLIC_DOMAIN}/{file_key}/screenshots/{section['section_name']}.{section['section_screenshot_ext']}"

        payload = {
            "type": "process_section",
            "file_key": file_key,
            "section_id": section["section_id"],
            "section_name": section["section_name"],
            "section_index": idx,
            "section_data_path": section["section_data_path"],
            "section_images_path": section["section_images_path"],
            "section_screenshot_url": section_screenshot_url,
            "image_count": section["image_count"],
            "total_sections": total_sections,
            "full_design_screenshot_url": full_design_screenshot_url,
        }

        enqueue(payload, queue_name=SECTIONS_QUEUE)
        print(f"  ✓ Enqueued: {section['section_name']} (index {idx})")
        print(f"    Screenshot: {section_screenshot_url}")

    print(f"\n✅ Done! All {total_sections} sections enqueued.")

if __name__ == "__main__":
    file_key = "RPrT21DMtANvlRchlFWAsp"
    test_enqueue_with_r2_urls(file_key)
