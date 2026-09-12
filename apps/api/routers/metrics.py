from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from apps.api.database import get_db
from apps.api.models import (
    User, Project, Agent, Trace, LLMCall, ToolCall, PolicyViolation, TraceEvent
)
from apps.api.schemas import (
    OverviewMetricsResponse, CostBreakdownResponse, SpendByProvider
)
from apps.api.auth import get_current_user

router = APIRouter(prefix="/metrics", tags=["Metrics & Analytics"])

@router.get("/overview", response_model=OverviewMetricsResponse)
def get_overview_metrics(
    agent_id: Optional[str] = None,
    time_range: str = "24h",  # 1h, 24h, 7d, 30d
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Trace).join(Project).filter(Project.organization_id == current_user.organization_id)
    if agent_id:
        query = query.filter(Trace.agent_id == agent_id)

    traces = query.all()
    total_runs = len(traces)

    if total_runs == 0:
        return OverviewMetricsResponse(
            total_runs=0,
            successful_runs=0,
            failed_runs=0,
            success_rate_percent=100.0,
            error_rate_percent=0.0,
            avg_latency_ms=0.0,
            p50_latency_ms=0.0,
            p95_latency_ms=0.0,
            total_tokens=0,
            total_cost_usd=0.0,
            tool_failures=0,
            policy_violations=0
        )

    successful_runs = len([t for t in traces if t.status == "SUCCESS"])
    failed_runs = len([t for t in traces if t.status != "SUCCESS"])
    success_rate = round((successful_runs / total_runs) * 100.0, 1)
    error_rate = round(100.0 - success_rate, 1)

    latencies = sorted([t.total_duration_ms for t in traces])
    avg_latency = round(sum(latencies) / total_runs, 1)
    p50_idx = int(total_runs * 0.5)
    p95_idx = int(total_runs * 0.95)
    p50_latency = round(latencies[p50_idx if p50_idx < total_runs else -1], 1)
    p95_latency = round(latencies[p95_idx if p95_idx < total_runs else -1], 1)

    total_tokens = sum((t.total_input_tokens + t.total_output_tokens) for t in traces)
    total_cost = round(sum(t.total_cost_usd for t in traces), 4)

    # Tool failures
    tool_failures = db.query(ToolCall).join(TraceEvent).join(Trace).join(Project).filter(
        Project.organization_id == current_user.organization_id,
        ToolCall.status != "SUCCESS"
    ).count()

    # Policy violations
    policy_violations = db.query(PolicyViolation).join(Trace).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).count()

    return OverviewMetricsResponse(
        total_runs=total_runs,
        successful_runs=successful_runs,
        failed_runs=failed_runs,
        success_rate_percent=success_rate,
        error_rate_percent=error_rate,
        avg_latency_ms=avg_latency,
        p50_latency_ms=p50_latency,
        p95_latency_ms=p95_latency,
        total_tokens=total_tokens,
        total_cost_usd=total_cost,
        tool_failures=tool_failures,
        policy_violations=policy_violations
    )

@router.get("/cost-breakdown", response_model=CostBreakdownResponse)
def get_cost_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    llm_calls = db.query(LLMCall).join(TraceEvent).join(Trace).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).all()

    provider_totals = {}
    total_spend = 0.0

    for call in llm_calls:
        prov = (call.provider or "openai").lower()
        provider_totals[prov] = provider_totals.get(prov, 0.0) + call.cost_usd
        total_spend += call.cost_usd

    if total_spend == 0:
        total_spend = 0.001  # avoid div zero

    providers_res = []
    for prov, amt in provider_totals.items():
        providers_res.append(SpendByProvider(
            provider=prov.capitalize(),
            amount_usd=round(amt, 4),
            percentage=round((amt / total_spend) * 100.0, 1)
        ))

    return CostBreakdownResponse(
        total_spend_usd=round(total_spend, 4),
        providers=providers_res
    )

@router.get("/agent-health", response_model=dict)
def get_agent_health_score(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from apps.api.health_engine import calculate_agent_health
    return calculate_agent_health(db, agent_id, current_user.organization_id)

