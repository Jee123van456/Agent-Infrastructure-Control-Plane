from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Agent, EvalDataset, DatasetCase, DatasetRun, Trace
from apps.api.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/datasets", tags=["Evaluation Datasets"])

class DatasetCreate(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None

class CaseCreate(BaseModel):
    input_query: str
    expected_tool: Optional[str] = None
    expected_output_contains: Optional[str] = None

class RunCreate(BaseModel):
    agent_id: str
    agent_version: str

@router.get("", response_model=List[dict])
def list_datasets(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    datasets = db.query(EvalDataset).filter(EvalDataset.project_id == project_id).all()
    res = []
    for d in datasets:
        case_count = len(d.cases)
        latest_run = db.query(DatasetRun).filter(DatasetRun.dataset_id == d.id).order_by(DatasetRun.created_at.desc()).first()
        res.append({
            "id": d.id,
            "project_id": d.project_id,
            "name": d.name,
            "description": d.description,
            "case_count": case_count,
            "latest_pass_rate": latest_run.pass_rate_percent if latest_run else None,
            "created_at": d.created_at
        })
    return res

@router.post("", response_model=dict)
def create_dataset(
    payload: DatasetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == payload.project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ds = EvalDataset(
        project_id=payload.project_id,
        name=payload.name,
        description=payload.description
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return {"id": ds.id, "name": ds.name, "message": "Dataset created successfully"}

@router.post("/{dataset_id}/cases", response_model=dict)
def add_dataset_case(
    dataset_id: str,
    payload: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ds = db.query(EvalDataset).join(Project).filter(
        EvalDataset.id == dataset_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    case = DatasetCase(
        dataset_id=dataset_id,
        input_query=payload.input_query,
        expected_tool=payload.expected_tool,
        expected_output_contains=payload.expected_output_contains
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return {"id": case.id, "message": "Test case added to dataset"}

@router.post("/{dataset_id}/runs", response_model=dict)
def run_dataset_benchmark(
    dataset_id: str,
    payload: RunCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ds = db.query(EvalDataset).join(Project).filter(
        EvalDataset.id == dataset_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    agent = db.query(Agent).join(Project).filter(
        Agent.id == payload.agent_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    cases = ds.cases
    total_cases = len(cases)
    if total_cases == 0:
        return {"error": "Dataset has no test cases to evaluate"}

    # Evaluate traces matching agent and version against cases
    traces = db.query(Trace).filter(
        Trace.agent_id == payload.agent_id,
        Trace.agent_version == payload.agent_version
    ).all()

    passed_count = 0
    for case in cases:
        # Match case query against traces
        matched = [t for t in traces if case.input_query.lower() in (t.input_text or "").lower()]
        if matched and any(t.status == "SUCCESS" for t in matched):
            passed_count += 1

    pass_rate = round((passed_count / total_cases) * 100.0, 1)

    run = DatasetRun(
        dataset_id=dataset_id,
        agent_id=payload.agent_id,
        agent_version=payload.agent_version,
        total_cases=total_cases,
        passed_cases=passed_count,
        pass_rate_percent=pass_rate
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    return {
        "run_id": run.id,
        "agent_id": payload.agent_id,
        "version": payload.agent_version,
        "total_cases": total_cases,
        "passed_cases": passed_count,
        "pass_rate_percent": pass_rate
    }
