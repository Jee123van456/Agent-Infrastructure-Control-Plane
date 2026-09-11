from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Agent, Policy, PolicyViolation, Trace
from apps.api.schemas import PolicyCreate, PolicyResponse, PolicyViolationResponse
from apps.api.auth import get_current_user

router = APIRouter(prefix="/policies", tags=["Security Policies"])

@router.get("", response_model=List[PolicyResponse])
def list_policies(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Policy).join(Agent).join(Project).filter(
        Policy.agent_id == agent_id,
        Project.organization_id == current_user.organization_id
    ).all()

@router.post("", response_model=PolicyResponse)
def create_policy(
    payload: PolicyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).join(Project).filter(
        Agent.id == payload.agent_id,
        Project.organization_id == current_user.organization_id
    ).first()

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    policy = Policy(
        agent_id=payload.agent_id,
        tool_name=payload.tool_name,
        action_permission=payload.action_permission,
        risk_level=payload.risk_level
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.get("/violations", response_model=List[PolicyViolationResponse])
def list_policy_violations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    violations = db.query(PolicyViolation).join(Trace).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).order_by(PolicyViolation.created_at.desc()).limit(100).all()

    res = []
    for v in violations:
        trace = db.query(Trace).filter(Trace.id == v.trace_id).first()
        agent = db.query(Agent).filter(Agent.id == trace.agent_id).first() if trace else None
        res.append(PolicyViolationResponse(
            id=v.id,
            trace_id=v.trace_id,
            agent_id=agent.id if agent else None,
            agent_name=agent.name if agent else "Unknown Agent",
            action_attempted=v.action_attempted,
            severity=v.severity,
            status=v.status,
            created_at=v.created_at
        ))
    return res
