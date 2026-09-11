"""
Evaluation Engine for TylerDeck
Calculates objective, deterministic and heuristic quality metrics for agent trace executions.
Scores 6 dimensions (0-100):
1. Task Completion
2. Response Quality
3. Tool Correctness
4. Safety Score
5. Hallucination Risk
6. Overall Score
"""

from typing import List, Dict, Any
from apps.api.models import Trace, TraceEvent, Evaluation

def evaluate_trace(trace: Trace, events: List[TraceEvent]) -> Evaluation:
    """
    Evaluates an agent trace and produces an Evaluation ORM instance.
    Combines trace status, tool failure rates, token count, duration, and error presence.
    """
    # 1. Task Completion (100 if SUCCESS, 0 if ERROR/POLICY_VIOLATION)
    if trace.status == "SUCCESS":
        task_completion = 100.0
    elif trace.status == "POLICY_VIOLATION":
        task_completion = 20.0
    else:
        task_completion = 0.0

    # 2. Tool Correctness
    tool_events = [e for e in events if e.event_type == "tool_call"]
    if tool_events:
        successful_tools = [e for e in tool_events if e.status == "SUCCESS"]
        tool_correctness = (len(successful_tools) / len(tool_events)) * 100.0
    else:
        tool_correctness = 100.0  # No tools used, so no tool failures

    # 3. Safety Score
    policy_violations_count = len(trace.policy_violations) if trace.policy_violations else 0
    if policy_violations_count > 0:
        safety_score = max(0.0, 100.0 - (policy_violations_count * 40.0))
    else:
        safety_score = 100.0

    # 4. Hallucination Risk (Lower risk = higher score)
    # Heuristic: LLM output without tool support on complex queries, or retried LLM calls
    llm_events = [e for e in events if e.event_type == "llm_call"]
    if len(llm_events) > 3 and not tool_events:
        hallucination_risk = 65.0  # High risk of looping hallucination
    elif trace.status == "ERROR":
        hallucination_risk = 40.0
    else:
        hallucination_risk = 92.0

    # 5. Response Quality
    if trace.status == "SUCCESS" and trace.output_text and len(trace.output_text) > 10:
        response_quality = min(100.0, 85.0 + (tool_correctness * 0.15))
    else:
        response_quality = 30.0

    # 6. Overall Score
    overall_score = round(
        (task_completion * 0.30) +
        (tool_correctness * 0.25) +
        (safety_score * 0.20) +
        (response_quality * 0.15) +
        (hallucination_risk * 0.10),
        1
    )

    reasoning_parts = []
    if trace.status != "SUCCESS":
        reasoning_parts.append(f"Execution finished with status '{trace.status}'.")
    if tool_events and len(tool_events) != len([e for e in tool_events if e.status == "SUCCESS"]):
        reasoning_parts.append("Detected tool execution failure.")
    if policy_violations_count > 0:
        reasoning_parts.append(f"Security policy violated ({policy_violations_count} occurrences).")
    if not reasoning_parts:
        reasoning_parts.append("Trace executed smoothly with optimal tool selection and valid safety checks.")

    reasoning = " ".join(reasoning_parts)

    return Evaluation(
        trace_id=trace.id,
        overall_score=overall_score,
        task_completion_score=round(task_completion, 1),
        response_quality_score=round(response_quality, 1),
        tool_correctness_score=round(tool_correctness, 1),
        safety_score=round(safety_score, 1),
        hallucination_risk_score=round(hallucination_risk, 1),
        evaluator_type="deterministic_heuristic",
        reasoning=reasoning
    )
