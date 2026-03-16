import json
import os
import subprocess
import asyncio
import re
from pathlib import Path

from worker.ai.graph.state import GraphState, SectionInput
from worker.ai.services.llm_client import LLMClient
from worker.ai.services.prompts import (get_aggregator_prompt,
                                        get_component_generation_prompt)
from worker.ai.utils import sanitize_component_name

backend_root = Path(__file__).parent.parent.parent.parent

def clean_code_response(code: str) -> str:
    """Remove markdown code fences if LLM added them."""
    if "```" in code:
        code = (
            code.split("```tsx")[-1]
            .split("```ts")[-1]
            .split("```javascript")[-1]
            .split("```")[-1]
            .strip()
        )
        if "```" in code:
            code = code.split("```")[0].strip()
    return code


async def worker_node(section_input: SectionInput) -> dict:
    try:
        section_data_path = section_input["section_data_path"]

        with open(section_data_path, "r") as f:
            section_data = json.load(f)

        # toon_data_path = section_data_path.replace('section.json', 'section.toon')
        # with open(toon_data_path, "r") as f:
        #     toon_content = f.read()

        image_data = None
        if section_input["section_images_path"]:
            with open(section_input["section_images_path"], "r") as f:
                image_data = json.load(f)

        screenshot_url = section_input["section_screenshot_url"]

        prompt = get_component_generation_prompt(
            section_name=section_input["section_name"],
            section_data=section_data,
            # section_toon=toon_content,
            image_data=image_data,
            full_design_screenshot_url=None,
        )

        llm = LLMClient()

        if screenshot_url:
            result = await llm.generate_with_image(
                prompt, [screenshot_url]
            )
            code = result["content"]
            usage = result["usage"]
            print(f"\n=== Token Usage for {section_input['section_name']} ===")
            print(f"Input Tokens: {usage['input_tokens']}")
            print(f"Output Tokens: {usage['output_tokens']}")
            print(f"Total Tokens: {usage['total_tokens']}\n")
        else:
            code = await llm.generate_text(prompt)
            print(f"\n=== Generated {section_input['section_name']} (no screenshot) ===")

        code = clean_code_response(code)

        component_name = sanitize_component_name(section_input["section_name"])

        return {
            "worker_outputs": [
                {
                    "section_name": section_input["section_name"],
                    "section_index": section_input["section_index"],
                    "code": code,
                    "component_name": component_name,
                    "success": True,
                    "error": None,
                }
            ]
        }
    except Exception as e:
        print(f"Error in worker_node for {section_input['section_name']}: {str(e)}")
        return {
            "worker_outputs": [
                {
                    "section_name": section_input["section_name"],
                    "section_index": section_input["section_index"],
                    "code": "",
                    "component_name": "",
                    "success": False,
                    "error": str(e),
                }
            ]
        }


async def supervisor_node(state: GraphState):

    print("\n=== SUPERVISOR: Validating worker outputs ===")

    worker_outputs = state.get("worker_outputs", [])
    total_sections = state.get("total_sections", 0)

    print(f"Received {len(worker_outputs)}/{total_sections} worker outputs")
    successful_outputs = [w for w in worker_outputs if w["success"]]
    failed_outputs = [w for w in worker_outputs if not w["success"]]

    print(f"Executions Succeeded: {len(successful_outputs)}")
    print(f"Executions Failed: {len(failed_outputs)}")

    if not failed_outputs:
        print("All sections generated successfully")
        return {
            "status": "ready_for_aggregation",
            "completed_sections": len(successful_outputs),
        }
    else:
        return {
            "status": "failed",
            "error": f"Only {len(successful_outputs)}/{total_sections} sections succeeded",
        }


def ensure_client_directive(code: str) -> str:
    """
    Ensure 'use client' is added if code has event handlers or hooks.
    """
    # Check if "use client" already exists
    if '"use client"' in code or "'use client'" in code:
        return code
    
    # Check for event handlers or hooks
    client_indicators = [
        'onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur',
        'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo',
        'window.', 'document.', 'localStorage', 'sessionStorage',
        '<form', '<input', '<button'
    ]
    
    if any(indicator in code for indicator in client_indicators):
        # Add "use client" as first line
        return '"use client";\n\n' + code
    
    return code


async def aggregator_node(state: GraphState):
    try:
        worker_outputs = state["worker_outputs"]
        file_key = state["file_key"]
        full_design_screenshot_url = state.get("full_design_screenshot_url")

        successful_outputs = [output for output in worker_outputs if output["success"]]
        successful_outputs.sort(key=lambda x: x["section_index"])
        if not successful_outputs:
            raise Exception("No successfull section outputs to aggregate")

        component_outputs = [
            {"section_name": output["component_name"], "code": output["code"]}
            for output in successful_outputs
        ]

        prompt = get_aggregator_prompt(
            component_outputs=component_outputs,
            file_key=file_key,
            full_design_screenshot_url=full_design_screenshot_url,
        )

        llm = LLMClient()

        if full_design_screenshot_url:
            result = await llm.generate_with_image(
                prompt, [full_design_screenshot_url]
            )
            final_code = result["content"]
            usage = result["usage"]
            print(f"\n=== Token Usage for Aggregator ===")
            print(f"Input Tokens: {usage['input_tokens']}")
            print(f"Output Tokens: {usage['output_tokens']}")
            print(f"Total Tokens: {usage['total_tokens']}\n")
        else:
            final_code = await llm.generate_text(prompt)

        final_code = clean_code_response(final_code)
        
        # Ensure client directive is added if needed
        final_code = ensure_client_directive(final_code)

        return {
            "final_code": final_code,
            "completed_sections": len(successful_outputs),
            "status": "completed",
            "error": None,
        }
    except Exception as e:
        print(f"Erorr in aggregator_node: {str(e)}")
        return {"final_code": None, "status": "failed", "error": str(e)}
