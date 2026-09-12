from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Agent, AgentVersion, APIKey
from apps.api.schemas import (
    ProjectCreate, ProjectResponse,
    AgentCreate, AgentResponse, AgentVersionCreate, AgentVersionResponse,
    APIKeyCreate, APIKeyResponse, APIKeyCreatedResponse
)
from apps.api.auth import get_current_user, generate_api_key

router = APIRouter(prefix="/projects", tags=["Projects & Agents"])

# --- Projects ---
@router.get("", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Project).filter(Project.organization_id == current_user.organization_id).all()

@router.post("", response_model=ProjectResponse)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        organization_id=current_user.organization_id,
        name=payload.name,
        description=payload.description
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# --- Agents ---
@router.get("/{project_id}/agents", response_model=List[AgentResponse])
def list_agents(
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

    return db.query(Agent).filter(Agent.project_id == project_id).all()

@router.post("/{project_id}/agents", response_model=AgentResponse)
def create_agent(
    project_id: str,
    payload: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    agent = Agent(
        project_id=project_id,
        name=payload.name,
        description=payload.description,
        current_version=payload.initial_version or "v1.0"
    )
    db.add(agent)
    db.flush()

    ver = AgentVersion(
        agent_id=agent.id,
        version=agent.current_version,
        changelog="Initial agent creation"
    )
    db.add(ver)
    db.commit()
    db.refresh(agent)
    return agent

@router.post("/agents/{agent_id}/versions", response_model=AgentVersionResponse)
def add_agent_version(
    agent_id: str,
    payload: AgentVersionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).join(Project).filter(
        Agent.id == agent_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    ver = AgentVersion(
        agent_id=agent_id,
        version=payload.version,
        changelog=payload.changelog
    )
    db.add(ver)
    agent.current_version = payload.version
    db.commit()
    db.refresh(ver)
    return ver

# --- API Keys ---
@router.get("/{project_id}/api-keys", response_model=List[APIKeyResponse])
def list_api_keys(
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

    return db.query(APIKey).filter(
        APIKey.project_id == project_id,
        APIKey.is_active == True
    ).all()

@router.post("/{project_id}/api-keys", response_model=APIKeyCreatedResponse)
def create_api_key(
    project_id: str,
    payload: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    raw_key, prefix, key_hash = generate_api_key()
    api_key = APIKey(
        project_id=project_id,
        name=payload.name,
        key_prefix=prefix,
        key_hash=key_hash
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return APIKeyCreatedResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at,
        raw_key=raw_key
    )

@router.delete("/api-keys/{key_id}")
def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    key = db.query(APIKey).join(Project).filter(
        APIKey.id == key_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    key.is_active = False
    db.commit()
    return {"message": "API key revoked successfully"}
