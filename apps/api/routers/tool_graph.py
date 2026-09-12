from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from apps.api.database import get_db
from apps.api.models import User, Project, Agent, Trace, ToolCall, TraceEvent
from apps.api.auth import get_current_user

router = APIRouter(prefix="/tool-graph", tags=["Agent Tool Graph"])

@router.get("", response_model=dict)
def get_agent_tool_graph(
    agent_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns visual node-and-edge graph data showing agent-to-tool invocation frequency,
    failure rates, avg latency, and security risk level.
    """
    query = db.query(ToolCall, Trace.agent_id, Agent.name.label("agent_name")) \
              .select_from(ToolCall) \
              .join(TraceEvent, ToolCall.trace_event_id == TraceEvent.id) \
              .join(Trace, TraceEvent.trace_id == Trace.id) \
              .join(Agent, Trace.agent_id == Agent.id) \
              .join(Project, Trace.project_id == Project.id) \
              .filter(Project.organization_id == current_user.organization_id)

    if agent_id:
        query = query.filter(Trace.agent_id == agent_id)

    records = query.all()

    nodes = [{"id": "agent", "label": "Agent Core", "type": "agent", "risk": "LOW"}]
    edges = []
    tool_stats = {}

    for tool_call, aid, aname in records:
        tname = tool_call.tool_name
        if tname not in tool_stats:
            tool_stats[tname] = {
                "count": 0,
                "failures": 0,
                "total_duration_ms": 0.0,
                "category": tool_call.tool_category or "general"
            }
        tool_stats[tname]["count"] += 1
        tool_stats[tname]["total_duration_ms"] += (tool_call.execution_time_ms or 0.0)
        if tool_call.status != "SUCCESS":
            tool_stats[tname]["failures"] += 1

    for tname, stats in tool_stats.items():
        avg_dur = round(stats["total_duration_ms"] / stats["count"], 1) if stats["count"] > 0 else 0.0
        fail_rate = round((stats["failures"] / stats["count"]) * 100.0, 1) if stats["count"] > 0 else 0.0
        
        # Risk assessment based on category & fail rate
        risk = "LOW"
        if stats["category"] in ["payment", "shell", "database"] or fail_rate > 15.0:
            risk = "HIGH"
        elif stats["category"] in ["api", "search"] or fail_rate > 5.0:
            risk = "MEDIUM"

        nodes.append({
            "id": f"tool_{tname}",
            "label": tname,
            "type": "tool",
            "category": stats["category"],
            "risk": risk
        })

        edges.append({
            "source": "agent",
            "target": f"tool_{tname}",
            "call_count": stats["count"],
            "failure_rate_percent": fail_rate,
            "avg_latency_ms": avg_dur
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "total_tools_connected": len(tool_stats)
    }
