from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Prompt, PromptVersion
from apps.api.schemas import (
    PromptCreate, PromptResponse, PromptVersionCreate, PromptVersionResponse
)
from apps.api.auth import get_current_user

router = APIRouter(prefix="/prompts", tags=["Prompts"])

@router.get("", response_model=List[PromptResponse])
def list_prompts(
    project_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Prompt).join(Project).filter(Project.organization_id == current_user.organization_id)
    if project_id:
        query = query.filter(Prompt.project_id == project_id)

    prompts = query.order_by(Prompt.created_at.desc()).all()
    results = []
    for p in prompts:
        latest_ver = db.query(PromptVersion).filter(PromptVersion.prompt_id == p.id).order_by(PromptVersion.created_at.desc()).first()
        ver_resp = None
        if latest_ver:
            ver_resp = PromptVersionResponse(
                id=latest_ver.id,
                prompt_id=latest_ver.prompt_id,
                version=latest_ver.version,
                content=latest_ver.content,
                variables_json=latest_ver.variables_json,
                created_by=latest_ver.created_by,
                environment_label=latest_ver.environment_label,
                status=latest_ver.status,
                created_at=latest_ver.created_at
            )
        results.append(PromptResponse(
            id=p.id,
            project_id=p.project_id,
            name=p.name,
            description=p.description,
            created_at=p.created_at,
            current_version=ver_resp
        ))
    return results

@router.post("", response_model=PromptResponse)
def create_prompt(
    payload: PromptCreate,
    project_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_project_id = project_id
    if not target_project_id:
        proj = db.query(Project).filter(Project.organization_id == current_user.organization_id).first()
        if not proj:
            raise HTTPException(status_code=400, detail="No active project found")
        target_project_id = proj.id

    prompt = Prompt(
        project_id=target_project_id,
        name=payload.name,
        description=payload.description
    )
    db.add(prompt)
    db.flush()

    ver = PromptVersion(
        prompt_id=prompt.id,
        version="v1.0",
        content=payload.initial_content,
        variables_json={"variables": payload.variables or []},
        created_by=current_user.email,
        environment_label="production",
        status="ACTIVE"
    )
    db.add(ver)
    db.commit()
    db.refresh(prompt)

    ver_resp = PromptVersionResponse(
        id=ver.id,
        prompt_id=ver.prompt_id,
        version=ver.version,
        content=ver.content,
        variables_json=ver.variables_json,
        created_by=ver.created_by,
        environment_label=ver.environment_label,
        status=ver.status,
        created_at=ver.created_at
    )

    return PromptResponse(
        id=prompt.id,
        project_id=prompt.project_id,
        name=prompt.name,
        description=prompt.description,
        created_at=prompt.created_at,
        current_version=ver_resp
    )

@router.post("/{prompt_id}/versions", response_model=PromptVersionResponse)
def create_prompt_version(
    prompt_id: str,
    payload: PromptVersionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prompt = db.query(Prompt).join(Project).filter(
        Prompt.id == prompt_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    ver = PromptVersion(
        prompt_id=prompt.id,
        version=payload.version,
        content=payload.content,
        variables_json={"variables": payload.variables or []},
        created_by=current_user.email,
        environment_label=payload.environment_label or "production",
        status=payload.status or "ACTIVE"
    )
    db.add(ver)
    db.commit()
    db.refresh(ver)

    return PromptVersionResponse(
        id=ver.id,
        prompt_id=ver.prompt_id,
        version=ver.version,
        content=ver.content,
        variables_json=ver.variables_json,
        created_by=ver.created_by,
        environment_label=ver.environment_label,
        status=ver.status,
        created_at=ver.created_at
    )
