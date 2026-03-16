import operator
from typing import Annotated, List, TypedDict


class SectionInput(TypedDict):
    file_key: str
    section_id: str
    section_name: str
    section_index: int
    section_data_path: str
    section_images_path: str | None
    section_screenshot_url: str | None
    image_count: int
    full_design_screenshot_url: str | None


class WorkerOutput(TypedDict):
    section_name: str
    section_index: int
    code: str
    component_name: str
    success: bool
    error: str | None


class GraphState(TypedDict):
    file_key: str
    sections: List[SectionInput]
    worker_outputs: Annotated[List[WorkerOutput], operator.add]
    final_code: str | None
    total_sections: int
    completed_sections: int
    status: str
    error: str | None
