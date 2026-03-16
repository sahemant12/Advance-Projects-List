import asyncio

import imports
from exports.prisma.client import connect_db, disconnect_db
from exports.redis.queue import SECTIONS_QUEUE, dequeue, redis_client
from worker.ai.graph.workflow import execute_graph
from worker.ai.services.e2b_validator import create_nextjs_preview
from worker.figma.controllers.figma_handler import handle_figma_data


async def figma_worker():
    print("Figma Worker has started...")
    while True:
        try:
            node = dequeue(timeout=30)
            if node:
                if node.get("node_type") == "fetch_figma":
                    result = await handle_figma_data(node)
                    print(f"Result: {result}")
                else:
                    print(f"Unknown node type: {node.get('node_type')}")
                    continue
            await asyncio.sleep(0.1)
        except Exception as e:
            print(f"Error: {e}")
            await asyncio.sleep(0.1)


async def ai_worker():
    print("AI Worker has started..")
    sections_cache = {}
    while True:
        try:
            await asyncio.sleep(0.1)
            section = dequeue(queue_name=SECTIONS_QUEUE, timeout=30)
            if section:
                file_key = section["file_key"]
                if file_key not in sections_cache:
                    sections_cache[file_key] = {
                        "sections": [],
                        "total_expected": section.get("total_sections", 0),
                    }
                sections_cache[file_key]["sections"].append(section)
                if (
                    len(sections_cache[file_key]["sections"])
                    == sections_cache[file_key]["total_expected"]
                ):
                    sections = sections_cache[file_key]["sections"]
                    full_design_screenshot_url = sections[0].get(
                        "full_design_screenshot_url"
                    )
                    redis_client.setex(f"status:{file_key}", 3600, "processing")
                    print(f"Starting AI processing for {file_key}")

                    result = await execute_graph(
                        sections=sections,
                        file_key=file_key,
                        full_design_screenshot_url=full_design_screenshot_url,
                    )
                    if result["status"] == "completed":
                        print(f"Graph completed for {file_key}")
                        worker_outputs = result["worker_outputs"]
                        final_code = result["final_code"]
                        e2b_components = [
                            {
                                "component_name": output["component_name"],
                                "code": output["code"],
                            }
                            for output in worker_outputs
                            if output["success"]
                        ]
                        try:
                            print("Deploying to E2B sandbox...")
                            e2b_result = await create_nextjs_preview(
                                e2b_components, final_code
                            )
                            preview_url = e2b_result["preview_url"]
                            sandbox_id = e2b_result["sandbox_id"]
                            redis_client.setex(f"preview:{file_key}", 3600, preview_url)
                            redis_client.setex(f"sandbox:{file_key}", 3600, sandbox_id)
                            redis_client.setex(f"status:{file_key}", 3600, "completed")
                            print(f"PREVIEW URL: {preview_url}")
                        except Exception as e:
                            print(f"E2B deployment failed: {str(e)}")
                            redis_client.setex(
                                f"status:{file_key}",
                                3600,
                                f"failed:e2b_deployment:{str(e)}",
                            )
                    else:
                        print(f"AI graph failed: {result.get('error')}")
                        redis_client.setex(
                            f"status:{file_key}",
                            3600,
                            f"failed:ai_generation:{result.get('error')}",
                        )
                    del sections_cache[file_key]
        except Exception as e:
            print(f"AI Worker Failed: {e}")


async def main():
    print("Starting Vision2React Worker System...\n")
    await connect_db()
    try:
        await asyncio.gather(figma_worker(), ai_worker())
    finally:
        await disconnect_db()


if __name__ == "__main__":
    asyncio.run(main())
