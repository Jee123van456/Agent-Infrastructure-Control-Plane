"""
Policy Engine for TylerDeck
Validates agent tool executions against configured security policy rules.
Detects policy violations (ALLOW, REQUIRE_APPROVAL, BLOCK).
"""

from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from apps.api.models import Policy, PolicyViolation, Trace

def check_policy_violations(db: Session, agent_id: str, trace: Trace, tool_calls_data: List[dict]) -> List[PolicyViolation]:
    """
    Evaluates tool calls in a trace against configured agent policies.
    Returns a list of created PolicyViolation objects if any tool calls violate policies.
    """
    policies = db.query(Policy).filter(Policy.agent_id == agent_id).all()
    policy_map = {p.tool_name.lower(): p for p in policies}

    violations: List[PolicyViolation] = []

    for tc in tool_calls_data:
        tool_name = tc.get("tool_name", "").lower()
        
        # Default policy checks for common dangerous tools if explicit policy not created
        action_permission = "ALLOW"
        risk_level = "LOW"
        matched_policy = None

        if tool_name in policy_map:
            matched_policy = policy_map[tool_name]
            action_permission = matched_policy.action_permission
            risk_level = matched_policy.risk_level
        else:
            # Fallback heuristic for unconfigured high-risk tools
            if any(k in tool_name for k in ["shell", "bash", "execute_code", "os_system", "sudo"]):
                action_permission = "BLOCK"
                risk_level = "CRITICAL"
            elif any(k in tool_name for k in ["payment", "wire_transfer", "charge_card"]):
                action_permission = "REQUIRE_APPROVAL"
                risk_level = "HIGH"

        if action_permission == "BLOCK":
            pv = PolicyViolation(
                trace_id=trace.id,
                policy_id=matched_policy.id if matched_policy else None,
                action_attempted=f"Blocked attempt to execute forbidden tool '{tc.get('tool_name')}'",
                severity=risk_level,
                status="BLOCKED"
            )
            violations.append(pv)
        elif action_permission == "REQUIRE_APPROVAL":
            pv = PolicyViolation(
                trace_id=trace.id,
                policy_id=matched_policy.id if matched_policy else None,
                action_attempted=f"Executed unapproved sensitive tool '{tc.get('tool_name')}' without human approval",
                severity=risk_level,
                status="AUDITED"
            )
            violations.append(pv)

    return violations
