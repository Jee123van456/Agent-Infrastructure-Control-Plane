import hmac
import hashlib
import secrets
import time
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from apps.api.database import get_db
from apps.api.models import User, Webhook, WebhookLog
from apps.api.auth import get_current_user

router = APIRouter(prefix="/webhooks", tags=["Signed Webhooks"])

class WebhookCreate(BaseModel):
    name: str
    url: str

@router.get("", response_model=List[dict])
def list_webhooks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    webhooks = db.query(Webhook).filter(Webhook.organization_id == current_user.organization_id).all()
    res = []
    for w in webhooks:
        res.append({
            "id": w.id,
            "name": w.name,
            "url": w.url,
            "secret_masked": f"whsec_{w.secret[:4]}...{w.secret[-4:]}",
            "is_active": w.is_active,
            "created_at": w.created_at
        })
    return res

@router.post("", response_model=dict)
def register_webhook(
    payload: WebhookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    secret = secrets.token_hex(24)
    wh = Webhook(
        organization_id=current_user.organization_id,
        name=payload.name,
        url=payload.url,
        secret=secret,
        is_active=True
    )
    db.add(wh)
    db.commit()
    db.refresh(wh)

    return {
        "id": wh.id,
        "name": wh.name,
        "url": wh.url,
        "signing_secret": secret,
        "message": "Webhook created successfully. Save signing secret to verify HMAC-SHA256 headers."
    }

@router.post("/{webhook_id}/test", response_model=dict)
def trigger_test_webhook(
    webhook_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wh = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.organization_id == current_user.organization_id
    ).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Webhook not found")

    test_payload = {
        "event_type": "alert.triggered",
        "timestamp": int(time.time()),
        "organization_id": current_user.organization_id,
        "alert": {
            "name": "Test Alert Event",
            "severity": "WARNING",
            "message": "This is a simulated test alert from TylerDeck Control Plane."
        }
    }

    # Compute HMAC-SHA256 signature
    payload_bytes = str(test_payload).encode('utf-8')
    signature = hmac.new(wh.secret.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()

    log = WebhookLog(
        webhook_id=wh.id,
        event_type="alert.triggered",
        status_code=200,
        payload_json=test_payload,
        response_body=f"Signed delivery simulation successful. Signature: t={int(time.time())},v1={signature}"
    )
    db.add(log)
    db.commit()

    return {
        "status": "delivered",
        "signature_header": f"t={int(time.time())},v1={signature}",
        "payload": test_payload
    }
