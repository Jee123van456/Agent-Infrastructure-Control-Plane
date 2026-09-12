import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from apps.api.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "TylerDeck API"

def test_auth_flow():
    # Login with seeded user
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alex@acmeai.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
    token = data["access_token"]

    # Test /auth/me
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "alex@acmeai.com"

def test_metrics_overview():
    # Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alex@acmeai.com",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]

    metrics_resp = client.get("/api/v1/metrics/overview", headers={"Authorization": f"Bearer {token}"})
    assert metrics_resp.status_code == 200
    m_data = metrics_resp.json()
    assert m_data["total_runs"] > 0
    assert "success_rate_percent" in m_data

def test_sdk_trace_ingestion():
    # Ingest trace using known test key
    test_key = "td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c"
    
    payload = {
        "agent_id": "Customer Support Agent",
        "agent_version": "v1.5",
        "trace_id": "test_tr_sdk_999",
        "name": "Unit Test Ingestion Flow",
        "environment": "test",
        "user_id": "usr_test_1",
        "input_text": "How do I update my billing email?",
        "output_text": "Navigated to Settings > Billing and updated email.",
        "total_duration_ms": 1420.5,
        "status": "SUCCESS",
        "events": [
            {
                "event_type": "llm_call",
                "name": "LLM: OpenAI/gpt-4o-mini",
                "duration_ms": 500.0,
                "status": "SUCCESS",
                "llm_call": {
                    "provider": "openai",
                    "model": "gpt-4o-mini",
                    "prompt_tokens": 500,
                    "completion_tokens": 120
                }
            }
        ]
    }

    ingest_resp = client.post(
        "/api/v1/traces",
        json=payload,
        headers={"Authorization": f"Bearer {test_key}"}
    )
    assert ingest_resp.status_code == 200
    assert ingest_resp.json()["status"] == "success"

def test_tool_graph_endpoint():
    login_resp = client.post("/api/v1/auth/login", json={"email": "alex@acmeai.com", "password": "password123"})
    token = login_resp.json()["access_token"]

    resp = client.get("/api/v1/tool-graph", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "nodes" in data
    assert "edges" in data

def test_webhooks_endpoint():
    login_resp = client.post("/api/v1/auth/login", json={"email": "alex@acmeai.com", "password": "password123"})
    token = login_resp.json()["access_token"]

    create_resp = client.post("/api/v1/webhooks", json={"name": "Audit Webhook", "url": "https://example.com/hook"}, headers={"Authorization": f"Bearer {token}"})
    assert create_resp.status_code == 200
    assert "signing_secret" in create_resp.json()

    list_resp = client.get("/api/v1/webhooks", headers={"Authorization": f"Bearer {token}"})
    assert list_resp.status_code == 200
    assert len(list_resp.json()) > 0

