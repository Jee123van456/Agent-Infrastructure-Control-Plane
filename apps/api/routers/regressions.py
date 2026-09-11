from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Agent, Project
from apps.api.schemas import AgentRegressionReport
from apps.api.auth import get_current_user
from apps.api.regression_engine import analyze_agent_regression

router = APIRouter(prefix="/regressions", tags=["Agent Regressions"])

@router.get("/{agent_id}", response_model=AgentRegressionReport)
def get_agent_regression_report(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).join(Project).filter(
        Agent.id == agent_id,
        Project.organization_id == current_user.organization_id
    ).first()

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return analyze_agent_regression(db, agent_id)

@router.get("", response_model=List[AgentRegressionReport])
def list_all_agent_regressions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agents = db.query(Agent).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).all()

    reports = []
    for ag in agents:
        reports.append(analyze_agent_regression(db, ag.id))
    return reports
