from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from apps.api.database import get_db
from apps.api.models import User, Project, Session as SessionModel, Trace
from apps.api.schemas import SessionCreate, SessionResponse
from apps.api.auth import get_current_user

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.get("", response_model=List[SessionResponse])
def list_sessions(
    project_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    environment: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SessionModel).join(Project).filter(Project.organization_id == current_user.organization_id)
    if project_id:
        query = query.filter(SessionModel.project_id == project_id)
    if agent_id:
        query = query.filter(SessionModel.agent_id == agent_id)
    if environment:
        query = query.filter(SessionModel.environment == environment)

    sessions = query.order_by(SessionModel.created_at.desc()).all()
    results = []
    for s in sessions:
        traces = db.query(Trace).filter(Trace.session_id == s.id).all()
        trace_count = len(traces)
        total_cost = sum(t.total_cost_usd for t in traces)
        total_latency = sum(t.total_duration_ms for t in traces)

        results.append(SessionResponse(
            id=s.id,
            project_id=s.project_id,
            agent_id=s.agent_id,
            environment=s.environment,
            external_session_id=s.external_session_id,
            user_id_external=s.user_id_external,
            metadata_json=s.metadata_json,
            created_at=s.created_at,
            updated_at=s.updated_at,
            trace_count=trace_count,
            total_cost_usd=round(total_cost, 6),
            total_latency_ms=round(total_latency, 2)
        ))
    return results

@router.get("/{session_id}", response_model=SessionResponse)
def get_session_detail(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(SessionModel).join(Project).filter(
        SessionModel.id == session_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")

    traces = db.query(Trace).filter(Trace.session_id == s.id).all()
    trace_count = len(traces)
    total_cost = sum(t.total_cost_usd for t in traces)
    total_latency = sum(t.total_duration_ms for t in traces)

    return SessionResponse(
        id=s.id,
        project_id=s.project_id,
        agent_id=s.agent_id,
        environment=s.environment,
        external_session_id=s.external_session_id,
        user_id_external=s.user_id_external,
        metadata_json=s.metadata_json,
        created_at=s.created_at,
        updated_at=s.updated_at,
        trace_count=trace_count,
        total_cost_usd=round(total_cost, 6),
        total_latency_ms=round(total_latency, 2)
    )
