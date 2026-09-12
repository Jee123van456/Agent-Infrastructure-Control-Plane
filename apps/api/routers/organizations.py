from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User, Organization
from apps.api.schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from apps.api.auth import get_current_user

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("", response_model=List[OrganizationResponse])
def list_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orgs = db.query(Organization).filter(Organization.id == current_user.organization_id).all()
    return orgs

@router.get("/{id}", response_model=OrganizationResponse)
def get_organization(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.organization_id != id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not belong to this organization")
    
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.post("", response_model=OrganizationResponse)
def create_organization(
    payload: OrganizationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    slug = payload.name.lower().replace(" ", "-").replace("_", "-")
    org = Organization(
        name=payload.name,
        slug=f"{slug}-{hash(payload.name) % 10000}"
    )
    db.add(org)
    current_user.organization_id = org.id
    db.commit()
    db.refresh(org)
    return org

@router.patch("/{id}", response_model=OrganizationResponse)
def update_organization(
    id: str,
    payload: OrganizationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.organization_id != id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not belong to this organization")

    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if payload.name:
        org.name = payload.name
    if payload.slug:
        org.slug = payload.slug

    db.commit()
    db.refresh(org)
    return org
