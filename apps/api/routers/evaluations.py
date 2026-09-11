from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Trace, Evaluation
from apps.api.schemas import EvaluationScore
from apps.api.auth import get_current_user

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

@router.get("", response_model=List[dict])
def list_evaluations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evals = db.query(Evaluation).join(Trace).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).order_by(Evaluation.created_at.desc()).limit(100).all()

    res = []
    for e in evals:
        trace = db.query(Trace).filter(Trace.id == e.trace_id).first()
        res.append({
            "id": e.id,
            "trace_id": e.trace_id,
            "trace_name": trace.name if trace else "Trace",
            "overall_score": e.overall_score,
            "task_completion_score": e.task_completion_score,
            "response_quality_score": e.response_quality_score,
            "tool_correctness_score": e.tool_correctness_score,
            "safety_score": e.safety_score,
            "hallucination_risk_score": e.hallucination_risk_score,
            "evaluator_type": e.evaluator_type,
            "reasoning": e.reasoning,
            "created_at": e.created_at
        })
    return res
