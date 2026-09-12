from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Project, Agent, AgentVersion, APIKey, EnvironmentModel, Trace
from apps.api.schemas import (
    ProjectCreate, ProjectResponse, ProjectDetailResponse,
    EnvironmentCreate, EnvironmentResponse,
    AgentCreate, AgentResponse, AgentVersionCreate, AgentVersionResponse,
    APIKeyCreate, APIKeyResponse, APIKeyCreatedResponse
)
from apps.api.auth import get_current_user, generate_api_key

router = APIRouter(prefix="", tags=["Projects, Environments & Agents"])

# --- Projects ---
@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Project).filter(Project.organization_id == current_user.organization_id).order_by(Project.created_at.desc()).all()

@router.post("/projects", response_model=ProjectResponse)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Project name cannot be empty")

    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not associated with an organization."
        )

    try:
        project = Project(
            organization_id=current_user.organization_id,
            name=payload.name.strip(),
            description=payload.description
        )
        db.add(project)
        db.flush()

        # Automatically create default environments: development, staging, production
        for env_name in ["development", "staging", "production"]:
            env_rec = EnvironmentModel(
                project_id=project.id,
                name=env_name,
                slug=env_name,
                description=f"{env_name.capitalize()} environment"
            )
            db.add(env_rec)

        db.commit()
        db.refresh(project)
        return project
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create project: {exc}")

@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project_detail(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access forbidden")

    envs = db.query(EnvironmentModel).filter(EnvironmentModel.project_id == project_id).all()
    agents = db.query(Agent).filter(Agent.project_id == project_id).all()
    trace_count = db.query(Trace).filter(Trace.project_id == project_id).count()

    env_responses = [
        EnvironmentResponse(
            id=e.id,
            project_id=e.project_id,
            name=e.name,
            slug=e.slug,
            description=e.description,
            created_at=e.created_at
        ) for e in envs
    ]

    agent_responses = [
        AgentResponse(
            id=a.id,
            project_id=a.project_id,
            name=a.name,
            description=a.description,
            environment=a.environment or "development",
            framework=a.framework or "custom",
            provider=a.provider or "openai",
            model=a.model or "gpt-4o",
            current_version=a.current_version or "v1.0.0",
            created_at=a.created_at
        ) for a in agents
    ]

    return ProjectDetailResponse(
        id=project.id,
        organization_id=project.organization_id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        environments=env_responses,
        agents=agent_responses,
        trace_count=trace_count
    )

@router.patch("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name:
        project.name = payload.name.strip()
    if payload.description is not None:
        project.description = payload.description

    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{project_id}")
def delete_project(
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

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

# --- Environments ---
@router.get("/projects/{project_id}/environments", response_model=List[EnvironmentResponse])
def list_environments(
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

    envs = db.query(EnvironmentModel).filter(EnvironmentModel.project_id == project_id).all()
    return [
        EnvironmentResponse(
            id=e.id,
            project_id=e.project_id,
            name=e.name,
            slug=e.slug,
            description=e.description,
            created_at=e.created_at
        ) for e in envs
    ]

@router.post("/projects/{project_id}/environments", response_model=EnvironmentResponse)
def create_environment(
    project_id: str,
    payload: EnvironmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    slug = payload.name.lower().replace(" ", "-")
    existing = db.query(EnvironmentModel).filter(
        EnvironmentModel.project_id == project_id,
        EnvironmentModel.slug == slug
    ).first()
    if existing:
        return EnvironmentResponse(
            id=existing.id,
            project_id=existing.project_id,
            name=existing.name,
            slug=existing.slug,
            description=existing.description,
            created_at=existing.created_at
        )

    env_rec = EnvironmentModel(
        project_id=project_id,
        name=payload.name,
        slug=slug,
        description=payload.description
    )
    db.add(env_rec)
    db.commit()
    db.refresh(env_rec)
    return EnvironmentResponse(
        id=env_rec.id,
        project_id=env_rec.project_id,
        name=env_rec.name,
        slug=env_rec.slug,
        description=env_rec.description,
        created_at=env_rec.created_at
    )

# --- Agents ---
@router.get("/agents", response_model=List[AgentResponse])
def list_all_organization_agents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agents = db.query(Agent).join(Project).filter(
        Project.organization_id == current_user.organization_id
    ).order_by(Agent.created_at.desc()).all()
    return [
        AgentResponse(
            id=a.id,
            project_id=a.project_id,
            name=a.name,
            description=a.description,
            environment=a.environment or "development",
            framework=a.framework or "custom",
            provider=a.provider or "openai",
            model=a.model or "gpt-4o",
            current_version=a.current_version or "v1.0.0",
            created_at=a.created_at
        ) for a in agents
    ]

@router.get("/projects/{project_id}/agents", response_model=List[AgentResponse])
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

    agents = db.query(Agent).filter(Agent.project_id == project_id).all()
    return [
        AgentResponse(
            id=a.id,
            project_id=a.project_id,
            name=a.name,
            description=a.description,
            environment=a.environment or "development",
            framework=a.framework or "custom",
            provider=a.provider or "openai",
            model=a.model or "gpt-4o",
            current_version=a.current_version or "v1.0.0",
            created_at=a.created_at
        ) for a in agents
    ]

@router.post("/projects/{project_id}/agents", response_model=AgentResponse)
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

    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Agent name cannot be empty")

    init_ver = payload.initial_version or "v1.0.0"

    try:
        agent = Agent(
            project_id=project_id,
            name=payload.name.strip(),
            description=payload.description,
            environment=payload.environment or "development",
            framework=payload.framework or "custom",
            provider=payload.provider or "openai",
            model=payload.model or "gpt-4o",
            current_version=init_ver
        )
        db.add(agent)
        db.flush()

        # Atomic creation of initial version v1.0.0
        ver = AgentVersion(
            agent_id=agent.id,
            version=init_ver,
            provider=agent.provider,
            model=agent.model,
            status="active",
            changelog="Initial agent creation release"
        )
        db.add(ver)
        db.commit()
        db.refresh(agent)

        return AgentResponse(
            id=agent.id,
            project_id=agent.project_id,
            name=agent.name,
            description=agent.description,
            environment=agent.environment,
            framework=agent.framework,
            provider=agent.provider,
            model=agent.model,
            current_version=agent.current_version,
            created_at=agent.created_at
        )
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {exc}")

@router.get("/agents/{agent_id}", response_model=AgentResponse)
def get_agent_detail(
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

    return AgentResponse(
        id=agent.id,
        project_id=agent.project_id,
        name=agent.name,
        description=agent.description,
        environment=agent.environment or "development",
        framework=agent.framework or "custom",
        provider=agent.provider or "openai",
        model=agent.model or "gpt-4o",
        current_version=agent.current_version or "v1.0.0",
        created_at=agent.created_at
    )

@router.patch("/agents/{agent_id}", response_model=AgentResponse)
def update_agent(
    agent_id: str,
    payload: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).join(Project).filter(
        Agent.id == agent_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if payload.name:
        agent.name = payload.name.strip()
    if payload.description is not None:
        agent.description = payload.description
    if payload.environment:
        agent.environment = payload.environment
    if payload.provider:
        agent.provider = payload.provider
    if payload.model:
        agent.model = payload.model

    db.commit()
    db.refresh(agent)

    return AgentResponse(
        id=agent.id,
        project_id=agent.project_id,
        name=agent.name,
        description=agent.description,
        environment=agent.environment,
        framework=agent.framework,
        provider=agent.provider,
        model=agent.model,
        current_version=agent.current_version,
        created_at=agent.created_at
    )

@router.delete("/agents/{agent_id}")
def delete_agent(
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

    db.delete(agent)
    db.commit()
    return {"message": "Agent deleted successfully"}

# --- Agent Versions ---
@router.get("/agents/{agent_id}/versions", response_model=List[AgentVersionResponse])
def list_agent_versions(
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

    vers = db.query(AgentVersion).filter(AgentVersion.agent_id == agent_id).order_by(AgentVersion.created_at.desc()).all()
    return [
        AgentVersionResponse(
            id=v.id,
            agent_id=v.agent_id,
            version=v.version,
            provider=v.provider,
            model=v.model,
            configuration_json=v.configuration_json,
            status=v.status or "active",
            changelog=v.changelog,
            created_at=v.created_at
        ) for v in vers
    ]

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

    # Prevent duplicate version strings for the same agent
    existing = db.query(AgentVersion).filter(
        AgentVersion.agent_id == agent_id,
        AgentVersion.version == payload.version
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Version '{payload.version}' already exists for this agent")

    ver = AgentVersion(
        agent_id=agent_id,
        version=payload.version,
        provider=payload.provider or agent.provider,
        model=payload.model or agent.model,
        configuration_json=payload.configuration_json,
        status=payload.status or "active",
        changelog=payload.changelog
    )
    db.add(ver)
    agent.current_version = payload.version
    db.commit()
    db.refresh(ver)

    return AgentVersionResponse(
        id=ver.id,
        agent_id=ver.agent_id,
        version=ver.version,
        provider=ver.provider,
        model=ver.model,
        configuration_json=ver.configuration_json,
        status=ver.status,
        changelog=ver.changelog,
        created_at=ver.created_at
    )

# --- API Keys ---
@router.get("/projects/{project_id}/api-keys", response_model=List[APIKeyResponse])
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

    keys = db.query(APIKey).filter(
        APIKey.project_id == project_id,
        APIKey.is_active == True
    ).all()

    return [
        APIKeyResponse(
            id=k.id,
            name=k.name,
            environment=k.environment or "development",
            key_prefix=k.key_prefix,
            is_active=k.is_active,
            last_used_at=k.last_used_at,
            created_at=k.created_at
        ) for k in keys
    ]

@router.post("/projects/{project_id}/api-keys", response_model=APIKeyCreatedResponse)
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
        environment=payload.environment or "development",
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
        environment=api_key.environment,
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
    key.revoked_at = datetime.utcnow()
    db.commit()
    return {"message": "API key revoked successfully"}
