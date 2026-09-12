"""
Multi-Dimensional Agent Health Scoring Engine for TylerDeck.

Scoring Methodology (0-100 Range):
- Reliability (30% weight): Based on agent execution success rate and tool error frequency.
- Safety (25% weight): Deducts points for tool permission policy violations and unverified operations.
- Evaluation (20% weight): Average quality & task completion score from evaluation judge algorithms.
- Performance (15% weight): Scaled against latency P95 thresholds (100 for P95 <= 1.5s).
- Cost (10% weight): Scaled against average run cost thresholds (100 for avg run <= $0.01).
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from apps.api.models import Trace, ToolCall, PolicyViolation, Evaluation, TraceEvent, Project

def calculate_agent_health(db: Session, agent_id: str, organization_id: str) -> Dict[str, Any]:
    """
    Computes deterministic multi-dimensional health scores for a target agent.
    Returns:
    {
        "overall_score": 91,
        "reliability": 94,
        "performance": 89,
        "cost": 86,
        "safety": 98,
        "evaluation": 91,
        "run_count": 142
    }
    """
    traces = db.query(Trace).join(Project).filter(
        Trace.agent_id == agent_id,
        Project.organization_id == organization_id
    ).all()

    total_runs = len(traces)
    if total_runs == 0:
        return {
            "overall_score": 100,
            "reliability": 100,
            "performance": 100,
            "cost": 100,
            "safety": 100,
            "evaluation": 100,
            "run_count": 0
        }

    # 1. Reliability Score
    successful_runs = len([t for t in traces if t.status == "SUCCESS"])
    success_rate = (successful_runs / total_runs) * 100.0
    reliability_score = round(max(0.0, min(100.0, success_rate)), 1)

    # 2. Performance Score (Based on P95 Latency)
    latencies = sorted([t.total_duration_ms for t in traces])
    p95_idx = int(total_runs * 0.95)
    p95_latency_ms = latencies[p95_idx if p95_idx < total_runs else -1]

    if p95_latency_ms <= 1500.0:
        performance_score = 100.0
    elif p95_latency_ms >= 10000.0:
        performance_score = 40.0
    else:
        # Linear degradation between 1.5s (100) and 10s (40)
        performance_score = 100.0 - ((p95_latency_ms - 1500.0) / 8500.0) * 60.0
    performance_score = round(max(0.0, min(100.0, performance_score)), 1)

    # 3. Cost Score (Based on Avg Spend per Run)
    total_spend = sum(t.total_cost_usd for t in traces)
    avg_cost = total_spend / total_runs

    if avg_cost <= 0.01:
        cost_score = 100.0
    elif avg_cost >= 0.15:
        cost_score = 40.0
    else:
        cost_score = 100.0 - ((avg_cost - 0.01) / 0.14) * 60.0
    cost_score = round(max(0.0, min(100.0, cost_score)), 1)

    # 4. Safety Score (Deduction for Policy Violations)
    violation_count = db.query(PolicyViolation).join(Trace).join(Project).filter(
        Trace.agent_id == agent_id,
        Project.organization_id == organization_id
    ).count()
    safety_score = round(max(0.0, 100.0 - (violation_count * 10.0)), 1)

    # 5. Evaluation Score (Avg overall score from evaluations table)
    eval_records = db.query(Evaluation).join(Trace).join(Project).filter(
        Trace.agent_id == agent_id,
        Project.organization_id == organization_id
    ).all()

    if eval_records:
        eval_score = sum(e.overall_score for e in eval_records) / len(eval_records)
    else:
        eval_score = 90.0
    eval_score = round(max(0.0, min(100.0, eval_score)), 1)

    # 6. Overall Weighted Health Score
    overall = (
        (reliability_score * 0.30) +
        (safety_score * 0.25) +
        (eval_score * 0.20) +
        (performance_score * 0.15) +
        (cost_score * 0.10)
    )

    return {
        "overall_score": round(overall, 1),
        "reliability": reliability_score,
        "performance": performance_score,
        "cost": cost_score,
        "safety": safety_score,
        "evaluation": eval_score,
        "run_count": total_runs
    }
