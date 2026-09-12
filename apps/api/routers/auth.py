from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from apps.api.database import get_db
from apps.api.models import User, Organization, Project, Agent, APIKey, EnvironmentModel
from apps.api.schemas import UserSignup, UserLogin, OAuthLoginRequest, AuthResponse, UserResponse
from apps.api.auth import hash_password, verify_password, create_access_token, get_current_user, generate_api_key

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    # Check existing user
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create Organization
    slug = payload.organization_name.lower().replace(" ", "-").replace("_", "-")
    org = Organization(
        name=payload.organization_name,
        slug=f"{slug}-{hash(payload.email) % 10000}"
    )
    db.add(org)
    db.flush()

    # Create User
    user = User(
        organization_id=org.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role="owner"
    )
    db.add(user)
    db.flush()

    # Create Default Project & Agent
    project = Project(
        organization_id=org.id,
        name="Default Project",
        description="Default production environment"
    )
    db.add(project)
    db.flush()

    agent = Agent(
        project_id=project.id,
        name="Customer Support Agent",
        description="Production customer support assistant",
        current_version="v1.0"
    )
    db.add(agent)
    db.flush()

    # Generate initial API Key
    raw_key, prefix, key_hash = generate_api_key()
    api_key = APIKey(
        project_id=project.id,
        name="Default Live Key",
        key_prefix=prefix,
        key_hash=key_hash
    )
    db.add(api_key)
    db.commit()

    token = create_access_token({"sub": user.id, "org_id": org.id})
    return AuthResponse(
        access_token=token,
        user_id=user.id,
        organization_id=org.id,
        email=user.email,
        full_name=user.full_name
    )

@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "org_id": user.organization_id})
    return AuthResponse(
        access_token=token,
        user_id=user.id,
        organization_id=user.organization_id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        auth_provider=user.auth_provider or "email"
    )

@router.post("/oauth", response_model=AuthResponse)
def oauth_login(payload: OAuthLoginRequest, db: Session = Depends(get_db)):
    """
    Handles Google and Apple OAuth authentication and auto-provisions user & workspace.
    """
    provider = payload.provider.lower()
    if provider not in ["google", "apple"]:
        raise HTTPException(status_code=400, detail="Invalid OAuth provider. Must be 'google' or 'apple'")

    user = db.query(User).filter(User.email == payload.email).first()

    if user:
        # Existing user logging in via OAuth
        user.auth_provider = provider
        if payload.provider_user_id:
            user.provider_user_id = payload.provider_user_id
        if payload.avatar_url:
            user.avatar_url = payload.avatar_url
        user.email_verified = True
        db.commit()
        db.refresh(user)
    else:
        # Create new Organization & User securely
        full_name = payload.full_name or payload.email.split("@")[0].capitalize()
        org_name = payload.organization_name or f"{full_name}'s Workspace"
        slug_base = org_name.lower().replace(" ", "-").replace("_", "-")
        org_slug = f"{slug_base}-{abs(hash(payload.email)) % 10000}"

        org = Organization(name=org_name, slug=org_slug)
        db.add(org)
        db.flush()

        import secrets
        user = User(
            organization_id=org.id,
            email=payload.email,
            hashed_password=hash_password(secrets.token_urlsafe(24)),
            full_name=full_name,
            role="owner",
            auth_provider=provider,
            provider_user_id=payload.provider_user_id,
            avatar_url=payload.avatar_url,
            email_verified=True
        )
        db.add(user)
        db.flush()

        # Provision default workspace Project
        project = Project(
            organization_id=org.id,
            name="Default Project",
            description=f"{provider.capitalize()} authenticated default production workspace"
        )
        db.add(project)
        db.flush()

        # Default environments
        for env_name in ["development", "staging", "production"]:
            db.add(EnvironmentModel(
                project_id=project.id,
                name=env_name,
                slug=env_name,
                description=f"{env_name.capitalize()} environment"
            ))

        # Default Agent
        agent = Agent(
            project_id=project.id,
            name="Customer Support Agent",
            description="Production customer support assistant",
            current_version="v1.0.0"
        )
        db.add(agent)
        db.flush()

        # Generate API Key
        raw_key, prefix, key_hash = generate_api_key()
        api_key = APIKey(
            project_id=project.id,
            name="Default Live Key",
            key_prefix=prefix,
            key_hash=key_hash
        )
        db.add(api_key)
        db.commit()

    token = create_access_token({"sub": user.id, "org_id": user.organization_id})
    return AuthResponse(
        access_token=token,
        user_id=user.id,
        organization_id=user.organization_id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        auth_provider=user.auth_provider
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        organization_id=current_user.organization_id,
        avatar_url=current_user.avatar_url,
        auth_provider=current_user.auth_provider or "email"
    )
