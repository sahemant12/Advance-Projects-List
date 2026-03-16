import operator
from enum import Enum
from typing import Annotated, Any, Dict, List, TypedDict


class AgentStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class CodeReviewState(TypedDict):
    pr_data: Annotated[Dict[str, Any], lambda a, b: b]
    diff_data: Annotated[Dict[str, Any], lambda a, b: b]
    changed_files: Annotated[List[str], lambda a, b: b]
    pr_title: Annotated[str, lambda a, b: b]
    pr_description: Annotated[str, lambda a, b: b]

    code_graphs: Annotated[List[Dict], lambda a, b: b]
    import_files: Annotated[List[Dict], lambda a, b: b]
    learnings: Annotated[List[Dict], lambda a, b: b]
    comprehensive_context: Annotated[str, lambda a, b: b]

    context_fetcher_status: Annotated[AgentStatus, lambda a, b: b]
    security_agent_status: Annotated[AgentStatus, lambda a, b: b]
    code_quality_agent_status: Annotated[AgentStatus, lambda a, b: b]
    performance_agent_status: Annotated[AgentStatus, lambda a, b: b]
    aggregator_status: Annotated[AgentStatus, lambda a, b: b]

    security_analysis: Annotated[str, lambda a, b: b]
    code_quality_analysis: Annotated[str, lambda a, b: b]
    performance_analysis: Annotated[str, lambda a, b: b]

    final_review: Annotated[str, lambda a, b: b]
    inline_comments: Annotated[List[Dict], lambda a, b: b]
    total_issues: Annotated[int, lambda a, b: b]

    errors: Annotated[List[str], operator.add]
    warnings: Annotated[List[str], operator.add]
