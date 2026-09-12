from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Agent, Trace, ToolCall, PolicyViolation, TraceEvent
from apps.api.schemas import ErrorClusterItem
from apps.api.auth import get_current_user

router = APIRouter(prefix="/errors", tags=["Error Intelligence"])

@router.get("/clusters", response_model=List[ErrorClusterItem])
def get_error_clusters(
    agent_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns real error failure clusters aggregated from non-SUCCESS traces in PostgreSQL.
    Grouped by failure pattern, associating representative trace ID, affected agent, and version.
    """
    query = db.query(Trace).join(Project).filter(
        Project.organization_id == current_user.organization_id,
        Trace.status != "SUCCESS"
    )

    if agent_id:
        query = query.filter(Trace.agent_id == agent_id)

    traces = query.order_by(Trace.created_at.desc()).all()

    clusters = {
        "TOOL_TIMEOUT": {
            "name": "Tool Timeout (TOOL_TIMEOUT)",
            "type": "RUNTIME_FAILURE",
            "count": 0,
            "last_seen": datetime.now(timezone.utc),
            "sample": "Tool execution 'order_api' timed out after threshold",
            "trace_id": "",
            "agent": "Customer Support Agent",
            "version": "v1.1"
        },
        "INVALID_TOOL_ARGUMENT": {
            "name": "Invalid Tool Arguments",
            "type": "VALIDATION_ERROR",
            "count": 0,
            "last_seen": datetime.now(timezone.utc),
            "sample": "JSON Schema validation failed: missing required parameter 'order_id'",
            "trace_id": "",
            "agent": "Customer Support Agent",
            "version": "v1.1"
        },
        "SECURITY_POLICY_BLOCK": {
            "name": "Security Policy Violation",
            "type": "SECURITY_VIOLATION",
            "count": 0,
            "last_seen": datetime.now(timezone.utc),
            "sample": "SECURITY ALERT: Unapproved execution of high-risk tool 'payment_api'",
            "trace_id": "",
            "agent": "Finance Execution Agent",
            "version": "v1.0"
        },
        "LLM_RATE_LIMIT": {
            "name": "LLM Rate Limit / API Error",
            "type": "PROVIDER_ERROR",
            "count": 0,
            "last_seen": datetime.now(timezone.utc),
            "sample": "HTTP 429: Rate limit exceeded for provider model gpt-4o",
            "trace_id": "",
            "agent": "Market Research Agent",
            "version": "v1.0"
        }
    }

    for t in traces:
        agent_rec = db.query(Agent).filter(Agent.id == t.agent_id).first()
        agent_name = agent_rec.name if agent_rec else "Unknown Agent"

        if t.status == "POLICY_VIOLATION":
            c = clusters["SECURITY_POLICY_BLOCK"]
            c["count"] += 1
            c["last_seen"] = t.created_at
            c["trace_id"] = t.id
            c["agent"] = agent_name
            c["version"] = t.agent_version
            if t.error_message:
                c["sample"] = t.error_message
        elif t.error_message and ("timeout" in t.error_message.lower() or "timed out" in t.error_message.lower()):
            c = clusters["TOOL_TIMEOUT"]
            c["count"] += 1
            c["last_seen"] = t.created_at
            c["trace_id"] = t.id
            c["agent"] = agent_name
            c["version"] = t.agent_version
            c["sample"] = t.error_message
        elif t.error_message and ("argument" in t.error_message.lower() or "schema" in t.error_message.lower() or "validation" in t.error_message.lower()):
            c = clusters["INVALID_TOOL_ARGUMENT"]
            c["count"] += 1
            c["last_seen"] = t.created_at
            c["trace_id"] = t.id
            c["agent"] = agent_name
            c["version"] = t.agent_version
            c["sample"] = t.error_message
        else:
            c = clusters["LLM_RATE_LIMIT"]
            c["count"] += 1
            c["last_seen"] = t.created_at
            c["trace_id"] = t.id
            c["agent"] = agent_name
            c["version"] = t.agent_version
            if t.error_message:
                c["sample"] = t.error_message

    res = []
    for key, data in clusters.items():
        if data["count"] > 0:
            res.append(ErrorClusterItem(
                cluster_name=data["name"],
                error_type=data["type"],
                affected_runs=data["count"],
                last_seen=data["last_seen"],
                representative_trace_id=data["trace_id"],
                sample_error=data["sample"],
                affected_agent=data["agent"],
                affected_version=data["version"]
            ))

    return res
