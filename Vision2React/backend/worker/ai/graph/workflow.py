from langgraph.graph import END, StateGraph
from langgraph.types import Send

from worker.ai.graph.nodes import aggregator_node, supervisor_node, worker_node
from worker.ai.graph.state import GraphState, SectionInput


def route_initial_workers(state: GraphState):
    sections = state.get("sections", [])
    return [Send("worker", section) for section in sections]


def route_after_supervisor(state: GraphState) -> str:
    status = state.get("status", "")

    if status == "retry_validation":
        return "supervisor"
    elif status == "ready_for_aggregation":
        return "aggregator"
    else:
        return END


def create_workflow():
    workflow = StateGraph(GraphState)

    workflow.add_node("route_initial", lambda state: state)
    workflow.add_node("worker", worker_node)
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("aggregator", aggregator_node)

    workflow.set_entry_point("route_initial")

    workflow.add_conditional_edges("route_initial", route_initial_workers, ["worker"])

    workflow.add_edge("worker", "supervisor")

    workflow.add_conditional_edges(
        "supervisor",
        route_after_supervisor,
        {"supervisor": "supervisor", "aggregator": "aggregator", END: END},
    )

    workflow.add_edge("aggregator", END)

    return workflow.compile()


async def execute_graph(
    sections: list[SectionInput],
    file_key: str,
    full_design_screenshot_url: str | None = None,
):
    workflow = create_workflow()

    initial_state = {
        "file_key": file_key,
        "sections": sections,
        "worker_outputs": [],
        "final_code": None,
        "total_sections": len(sections),
        "completed_sections": 0,
        "status": "initialized",
        "error": None,
        "retry_count": 0,
        "full_design_screenshot_url": full_design_screenshot_url,
        "sections_to_retry": None,
    }

    result = await workflow.ainvoke(initial_state)
    return result
