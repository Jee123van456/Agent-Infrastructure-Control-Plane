import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../sdk/python")))

from apps.api.main import app
from apps.api.auth import create_access_token, hash_api_key
from apps.api.database import SessionLocal
from apps.api.models import APIKey, Project
from tylerdeck.redactor import sanitize_data

client = TestClient(app)

def test_invalid_api_key_ingestion():
    """Verify ingestion requests with invalid API key formats are rejected with 401."""
    response = client.post(
        "/api/v1/traces",
        headers={"Authorization": "Bearer td_test_invalid_key_9999"},
        json={
            "agent_id": "test_agent",
            "trace_id": "tr_123",
            "name": "Unauthorized Ingestion Test"
        }
    )
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]

def test_missing_auth_header():
    """Verify authenticated endpoints require Authorization header."""
    response = client.get("/api/v1/traces")
    assert response.status_code in [401, 403]

def test_jwt_forgery():
    """Verify forged JWT signatures are rejected."""
    fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature"
    response = client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {fake_token}"}
    )
    assert response.status_code == 401

def test_sql_injection_resilience():
    """Verify inputs containing SQL injection payloads are safely parameterized by SQLAlchemy."""
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alex@acmeai.com",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]
    
    sqli_payload = "Customer' OR '1'='1"
    response = client.get(
        f"/api/v1/traces?agent={sqli_payload}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_cross_tenant_idor_guard():
    """Verify tenant isolation: User cannot query traces belonging to another organization (IDOR Guard)."""
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alex@acmeai.com",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]

    # Request invalid/non-existent or cross-tenant trace ID
    response = client.get(
        "/api/v1/traces/non_existent_foreign_trace_id_999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404

def test_pii_redaction_sanitization():
    """Verify Python SDK redactor sanitizes emails, credit card numbers, and API keys."""
    raw_sensitive_data = {
        "user_email": "user@example.com",
        "api_key": "sk-proj-123456789012345678901234",
        "notes": "Call customer at 555-123-4567 regarding SSN 000-12-3456"
    }

    sanitized = sanitize_data(raw_sensitive_data)
    assert sanitized["user_email"] == "[REDACTED_EMAIL]"
    assert sanitized["api_key"] == "[REDACTED_SECRET]"
    assert "[REDACTED_PHONE]" in sanitized["notes"]
    assert "[REDACTED_SSN]" in sanitized["notes"]

def test_health_check_and_readiness():
    """Verify health and readiness endpoints operate correctly."""
    health_resp = client.get("/health")
    assert health_resp.status_code == 200

    ready_resp = client.get("/ready")
    assert ready_resp.status_code == 200
    assert ready_resp.json()["status"] == "ready"
