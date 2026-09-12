from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import (
    User, Project, Trace, UserFeedback, HumanAnnotation, EvalDataset, DatasetCase
)
from apps.api.schemas import (
    UserFeedbackCreate, UserFeedbackResponse, HumanAnnotationCreate, HumanAnnotationResponse
)
from apps.api.auth import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback & Annotations"])

@router.post("", response_model=UserFeedbackResponse)
def submit_user_feedback(
    payload: UserFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback = UserFeedback(
        trace_id=payload.trace_id,
        session_id=payload.session_id,
        feedback_type=payload.feedback_type,
        rating_value=payload.rating_value,
        comment=payload.comment,
        user_id_external=payload.user_id_external or current_user.email
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return UserFeedbackResponse(
        id=feedback.id,
        trace_id=feedback.trace_id,
        session_id=feedback.session_id,
        feedback_type=feedback.feedback_type,
        rating_value=feedback.rating_value,
        comment=feedback.comment,
        created_at=feedback.created_at
    )

@router.get("", response_model=List[UserFeedbackResponse])
def list_user_feedback(
    trace_id: Optional[str] = None,
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(UserFeedback)
    if trace_id:
        query = query.filter(UserFeedback.trace_id == trace_id)
    if session_id:
        query = query.filter(UserFeedback.session_id == session_id)

    feedbacks = query.order_by(UserFeedback.created_at.desc()).all()
    return [
        UserFeedbackResponse(
            id=f.id,
            trace_id=f.trace_id,
            session_id=f.session_id,
            feedback_type=f.feedback_type,
            rating_value=f.rating_value,
            comment=f.comment,
            created_at=f.created_at
        ) for f in feedbacks
    ]

@router.post("/annotations", response_model=HumanAnnotationResponse)
def submit_human_annotation(
    payload: HumanAnnotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trace = db.query(Trace).join(Project).filter(
        Trace.id == payload.trace_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    annotation = HumanAnnotation(
        trace_id=trace.id,
        reviewer_id=current_user.email,
        quality_score=payload.quality_score,
        correctness_score=payload.correctness_score,
        relevance_score=payload.relevance_score,
        safety_score=payload.safety_score,
        notes=payload.notes
    )
    db.add(annotation)
    db.commit()
    db.refresh(annotation)

    return HumanAnnotationResponse(
        id=annotation.id,
        trace_id=annotation.trace_id,
        reviewer_id=annotation.reviewer_id,
        quality_score=annotation.quality_score,
        correctness_score=annotation.correctness_score,
        relevance_score=annotation.relevance_score,
        safety_score=annotation.safety_score,
        notes=annotation.notes,
        created_at=annotation.created_at
    )

@router.post("/convert-to-dataset")
def convert_trace_to_dataset(
    trace_id: str,
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    1-Click Action: Converts a production trace into a golden test dataset case.
    """
    trace = db.query(Trace).join(Project).filter(
        Trace.id == trace_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    dataset = db.query(EvalDataset).join(Project).filter(
        EvalDataset.id == dataset_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    case = DatasetCase(
        dataset_id=dataset.id,
        input_query=trace.input_text or "Production sample query",
        expected_output_contains=trace.output_text[:100] if trace.output_text else None,
        metadata_json={"converted_from_trace_id": trace.id, "environment": trace.environment}
    )
    db.add(case)
    db.commit()

    return {
        "status": "success",
        "message": f"Trace '{trace.id}' successfully converted into Dataset case",
        "dataset_case_id": case.id
    }
