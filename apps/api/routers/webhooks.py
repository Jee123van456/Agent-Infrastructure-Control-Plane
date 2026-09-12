import hmac
import hashlib
import secrets
import time
import json
import urllib.request
import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from apps.api.database import get_db
from apps.api.models import User, Webhook, WebhookLog
from apps.api.auth import get_current_user

logger = logging.getLogger("tylerdeck.webhooks")
router = APIRouter(prefix="/webhooks", tags=["Signed Webhooks"])

class WebhookCreate(BaseModel):
    name: str
    url: str

def dispatch_webhook_event(db: Session, organization_id: str, event_type: str, event_payload: dict):
    """
    Dispatches a signed HTTP POST webhook event to all active webhooks registered for the organization.
    Computes HMAC-SHA256 signature passed in header: 'X-TylerDeck-Signature: t=<timestamp>,v1=<signature>'
    """
    webhooks = db.query(Webhook).filter(
        Webhook.organization_id == organization_id,
        Webhook.is_active == True
    ).all()

    now_ts = int(time.time())
    full_payload = {
        "event_type": event_type,
        "timestamp": now_ts,
        "organization_id": organization_id,
        "data": event_payload
    }
    raw_bytes = json.dumps(full_payload).encode('utf-8')

    for wh in webhooks:
        signature = hmac.new(wh.secret.encode('utf-8'), raw_bytes, hashlib.sha256).hexdigest()
        sig_header = f"t={now_ts},v1={signature}"
        
        req = urllib.request.Request(
            wh.url,
            data=raw_bytes,
            headers={
                "Content-Type": "application/json",
                "X-TylerDeck-Signature": sig_header,
                "User-Agent": "TylerDeck-Webhook-Dispatcher/1.0"
            },
            method="POST"
        )

        status_code = 500
        resp_body = ""
        try:
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                status_code = resp.status
                resp_body = resp.read().decode('utf-8')[:500]
        except Exception as exc:
            resp_body = f"Webhook delivery attempt error: {exc}"
            logger.warning(f"Failed to dispatch webhook {wh.id} to {wh.url}: {exc}")

        log = WebhookLog(
            webhook_id=wh.id,
            event_type=event_type,
            status_code=status_code,
            payload_json=full_payload,
            response_body=resp_body
        )
        db.add(log)

    db.commit()

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
        "event_type": "regression.detected",
        "timestamp": int(time.time()),
        "organization_id": current_user.organization_id,
        "regression": {
            "agent_id": "support-agent",
            "agent_name": "Customer Support Agent",
            "previous_version": "v1.0",
            "current_version": "v1.1",
            "metric": "Success Rate",
            "previous_value": "90.0%",
            "current_value": "70.0%",
            "severity": "HIGH"
        }
    }

    # Compute HMAC-SHA256 signature
    payload_bytes = json.dumps(test_payload).encode('utf-8')
    signature = hmac.new(wh.secret.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()

    status_code = 200
    response_msg = "Delivered locally"

    if wh.url.startswith("http"):
        try:
            req = urllib.request.Request(
                wh.url,
                data=payload_bytes,
                headers={
                    "Content-Type": "application/json",
                    "X-TylerDeck-Signature": f"t={int(time.time())},v1={signature}",
                    "User-Agent": "TylerDeck-Webhook-Dispatcher/1.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                status_code = resp.status
                response_msg = resp.read().decode('utf-8')[:500]
        except Exception as exc:
            status_code = 502
            response_msg = f"Delivery failed: {exc}"

    log = WebhookLog(
        webhook_id=wh.id,
        event_type="regression.detected",
        status_code=status_code,
        payload_json=test_payload,
        response_body=response_msg
    )
    db.add(log)
    db.commit()

    return {
        "status": "delivered" if status_code < 400 else "failed",
        "status_code": status_code,
        "signature_header": f"t={int(time.time())},v1={signature}",
        "payload": test_payload
    }
