"""
Regression Engine for TylerDeck
Analyzes agent performance metrics across versions (e.g., v1.4 vs v1.5).
Detects performance degradations, latency spikes, cost increases, and tool failures.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from apps.api.models import Agent, Trace, TraceEvent, AgentVersion
from apps.api.schemas import AgentRegressionReport, RegressionDetail

def analyze_agent_regression(db: Session, agent_id: str) -> AgentRegressionReport:
    """
    Compares the current version of an agent against its previous version.
    Generates a structured regression report.
    """
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        return AgentRegressionReport(
            agent_id=agent_id,
            agent_name="Unknown Agent",
            current_version="v1.0",
            previous_version="v0.9",
            is_regression_detected=False,
            regressions=[]
        )

    # Get distinct agent versions
    versions = db.query(AgentVersion).filter(
        AgentVersion.agent_id == agent_id
    ).order_by(AgentVersion.created_at.desc()).all()

    if len(versions) < 2:
        # Fallback to query distinct versions directly from traces if versions table is single
        trace_versions = db.query(Trace.agent_version).filter(
            Trace.agent_id == agent_id
        ).distinct().all()
        version_strings = [v[0] for v in trace_versions if v[0]]
        version_strings.sort(reverse=True)
        if len(version_strings) >= 2:
            curr_ver_str = version_strings[0]
            prev_ver_str = version_strings[1]
        else:
            curr_ver_str = agent.current_version
            prev_ver_str = "v1.0"
    else:
        curr_ver_str = versions[0].version
        prev_ver_str = versions[1].version

    # Function to get metrics for a version
    def get_version_stats(ver_str: str):
        traces = db.query(Trace).filter(
            Trace.agent_id == agent_id,
            Trace.agent_version == ver_str
        ).all()
        if not traces:
            return {"total": 0, "success": 0, "success_rate": 100.0, "avg_latency": 0.0, "avg_cost": 0.0}

        total = len(traces)
        successful = len([t for t in traces if t.status == "SUCCESS"])
        success_rate = (successful / total) * 100.0
        avg_latency = sum(t.total_duration_ms for t in traces) / float(total)
        avg_cost = sum(t.total_cost_usd for t in traces) / float(total)

        return {
            "total": total,
            "success": successful,
            "success_rate": round(success_rate, 1),
            "avg_latency": round(avg_latency, 1),
            "avg_cost": round(avg_cost, 6)
        }

    curr_stats = get_version_stats(curr_ver_str)
    prev_stats = get_version_stats(prev_ver_str)

    regressions: List[RegressionDetail] = []
    is_regression = False

    # Check Success Rate Regression (Drop > 3%)
    if prev_stats["total"] > 0 and curr_stats["total"] > 0:
        sr_diff = prev_stats["success_rate"] - curr_stats["success_rate"]
        if sr_diff >= 3.0:
            is_regression = True
            regressions.append(RegressionDetail(
                metric_name="Success Rate",
                previous_version=prev_ver_str,
                current_version=curr_ver_str,
                previous_value=f"{prev_stats['success_rate']}%",
                current_value=f"{curr_stats['success_rate']}%",
                delta_percent=round(-sr_diff, 1),
                severity="HIGH" if sr_diff > 8.0 else "MEDIUM",
                likely_factor="Likely associated with increased tool timeouts or prompt changes in new agent version."
            ))

        # Check Latency Spike (Increase > 20%)
        if prev_stats["avg_latency"] > 0:
            lat_increase = ((curr_stats["avg_latency"] - prev_stats["avg_latency"]) / prev_stats["avg_latency"]) * 100.0
            if lat_increase >= 20.0:
                is_regression = True
                regressions.append(RegressionDetail(
                    metric_name="Average Latency",
                    previous_version=prev_ver_str,
                    current_version=curr_ver_str,
                    previous_value=f"{round(prev_stats['avg_latency']/1000, 2)}s",
                    current_value=f"{round(curr_stats['avg_latency']/1000, 2)}s",
                    delta_percent=round(lat_increase, 1),
                    severity="MEDIUM",
                    likely_factor="Likely associated with redundant LLM retrieval calls or slow external API responses."
                ))

        # Check Cost Increase (> 25%)
        if prev_stats["avg_cost"] > 0:
            cost_increase = ((curr_stats["avg_cost"] - prev_stats["avg_cost"]) / prev_stats["avg_cost"]) * 100.0
            if cost_increase >= 25.0:
                is_regression = True
                regressions.append(RegressionDetail(
                    metric_name="Cost Per Run",
                    previous_version=prev_ver_str,
                    current_version=curr_ver_str,
                    previous_value=f"${prev_stats['avg_cost']}",
                    current_value=f"${curr_stats['avg_cost']}",
                    delta_percent=round(cost_increase, 1),
                    severity="INFO",
                    likely_factor="Likely associated with larger system prompt tokens or model upgrade (e.g. GPT-4o-mini to GPT-4o)."
                ))

    return AgentRegressionReport(
        agent_id=agent_id,
        agent_name=agent.name,
        current_version=curr_ver_str,
        previous_version=prev_ver_str,
        is_regression_detected=is_regression,
        regressions=regressions
    )
