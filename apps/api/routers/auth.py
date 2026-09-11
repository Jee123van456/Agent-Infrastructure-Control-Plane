from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from apps.api.database import get_db
from apps.api.models import User, Organization, Project, Agent, APIKey
from apps.api.schemas import UserSignup, UserLogin, AuthResponse, UserResponse
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
        full_name=user.full_name
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        organization_id=current_user.organization_id
    )
