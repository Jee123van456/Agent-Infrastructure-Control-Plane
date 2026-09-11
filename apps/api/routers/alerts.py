from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Agent, Alert, AlertEvent
from apps.api.auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[dict])
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(Alert).join(Agent).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).all()

    res = []
    for a in alerts:
        agent = db.query(Agent).filter(Agent.id == a.agent_id).first()
        res.append({
            "id": a.id,
            "agent_id": a.agent_id,
            "agent_name": agent.name if agent else "Agent",
            "name": a.name,
            "metric_type": a.metric_type,
            "threshold_value": a.threshold_value,
            "condition": a.condition,
            "is_active": a.is_active,
            "created_at": a.created_at
        })
    return res

@router.get("/events", response_model=List[dict])
def list_alert_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    events = db.query(AlertEvent).join(Alert).join(Agent).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).order_by(AlertEvent.created_at.desc()).limit(50).all()

    res = []
    for e in events:
        alert = db.query(Alert).filter(Alert.id == e.alert_id).first()
        agent = db.query(Agent).filter(Agent.id == alert.agent_id).first() if alert else None
        res.append({
            "id": e.id,
            "alert_name": alert.name if alert else "System Alert",
            "agent_name": agent.name if agent else "Customer Support Agent",
            "message": e.message,
            "current_value": e.current_value,
            "severity": e.severity,
            "created_at": e.created_at
        })
    return res
