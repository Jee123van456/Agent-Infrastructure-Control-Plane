import pytest
from fastapi.testclient import TestClient
from apps.api.main import app
from apps.api.auth import create_access_token

client = TestClient(app)

def test_invalid_api_key_ingestion():
    response = client.post(
        "/api/v1/traces",
        headers={"Authorization": "Bearer invalid_key_xyz"},
        json={
            "agent_id": "test_agent",
            "trace_id": "tr_123",
            "name": "Unauthorized Ingestion Test"
        }
    )
    assert response.status_code == 401
    assert "Invalid API Key" in response.json()["detail"]

def test_missing_auth_header():
    response = client.get("/api/v1/traces")
    assert response.status_code in [401, 403]

def test_jwt_forgery():
    fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature"
    response = client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {fake_token}"}
    )
    assert response.status_code == 401

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
