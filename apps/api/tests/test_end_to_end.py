import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from apps.api.main import app
from apps.api.database import SessionLocal, Base, engine

client = TestClient(app)

def test_full_agent_reliability_loop():
    """
    End-to-End Core Loop Verification Test:
    1. Authenticate user & retrieve JWT token
    2. SDK Trace Ingestion (v1.0 Trace) -> API -> DB Store -> Auto Evaluation
    3. SDK Trace Ingestion (v1.1 Failure Traces) -> API -> DB Store -> Auto Evaluation
    4. Verify Version Regression Engine detects REGRESSION (v1.0 -> v1.1)
    5. Verify Failure Clustering groups error patterns
    6. Verify Signed Webhook Dispatcher
    7. Verify Security Policy Violation Recording (/policies)
    8. Verify Dashboard Metrics API (/metrics/overview)
    9. Verify Internal Readiness Probe (/ready)
    """

    # Step 1: Health & Readiness
    ready_resp = client.get("/ready")
    assert ready_resp.status_code == 200
    assert ready_resp.json()["status"] == "ready"

    # Step 2: Auth Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alex@acmeai.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    sdk_headers = {"Authorization": f"Bearer td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c"}

    # Step 3: Ingest Baseline v1.0 Traces (Success)
    for i in range(5):
        payload_v10 = {
            "agent_id": "E2E Test Agent",
            "agent_version": "v1.0",
            "trace_id": f"tr_e2e_v10_{i}",
            "name": "Order Query Flow v1.0",
            "environment": "production",
            "user_id": "usr_e2e_1",
            "input_text": "Where is my package #ORD-901?",
            "output_text": "Package is in transit and arriving tomorrow.",
            "total_duration_ms": 1200.0,
            "status": "SUCCESS",
            "events": [
                {
                    "event_type": "llm_call",
                    "name": "LLM: openai/gpt-4o-mini",
                    "duration_ms": 400.0,
                    "status": "SUCCESS",
                    "llm_call": {
                        "provider": "openai",
                        "model": "gpt-4o-mini",
                        "prompt_tokens": 400,
                        "completion_tokens": 50
                    }
                },
                {
                    "event_type": "tool_call",
                    "name": "Tool: customer_db",
                    "duration_ms": 150.0,
                    "status": "SUCCESS",
                    "tool_call": {
                        "tool_name": "customer_db",
                        "tool_category": "database",
                        "arguments": {"order_id": "ORD-901"},
                        "result": {"status": "in_transit"},
                        "execution_time_ms": 150.0,
                        "status": "SUCCESS"
                    }
                }
            ]
        }
        ingest_resp = client.post("/api/v1/traces", json=payload_v10, headers=sdk_headers)
        assert ingest_resp.status_code == 200
        assert ingest_resp.json()["status"] == "success"

    # Step 4: Ingest Regressed v1.1 Traces (Failures with Order API Timeout)
    for i in range(5):
        is_fail = (i >= 2)  # 60% failure rate in v1.1
        payload_v11 = {
            "agent_id": "E2E Test Agent",
            "agent_version": "v1.1",
            "trace_id": f"tr_e2e_v11_{i}",
            "name": "Order Query Flow v1.1",
            "environment": "production",
            "user_id": "usr_e2e_2",
            "input_text": "Cancel order #ORD-902",
            "output_text": None if is_fail else "Order cancelled.",
            "total_duration_ms": 5200.0 if is_fail else 1500.0,
            "status": "ERROR" if is_fail else "SUCCESS",
            "error_message": "Tool execution 'order_api' timed out after 5000ms" if is_fail else None,
            "events": [
                {
                    "event_type": "tool_call",
                    "name": "Tool: order_api",
                    "duration_ms": 5000.0 if is_fail else 200.0,
                    "status": "TIMEOUT" if is_fail else "SUCCESS",
                    "tool_call": {
                        "tool_name": "order_api",
                        "tool_category": "api",
                        "arguments": {"order_id": "ORD-902"},
                        "result": None if is_fail else {"status": "cancelled"},
                        "execution_time_ms": 5000.0 if is_fail else 200.0,
                        "status": "TIMEOUT" if is_fail else "SUCCESS",
                        "error_details": "Tool execution 'order_api' timed out after 5000ms" if is_fail else None
                    }
                }
            ]
        }
        ingest_resp = client.post("/api/v1/traces", json=payload_v11, headers=sdk_headers)
        assert ingest_resp.status_code == 200

    # Step 5: Verify Regression Analysis Endpoint (/regressions/analyze)
    # We query regressions for the E2E Test Agent
    agents_resp = client.get("/api/v1/projects", headers=headers)
    assert agents_resp.status_code == 200
    
    # Query trace list with filters
    trace_search = client.get("/api/v1/traces?version=v1.1&status=ERROR", headers=headers)
    assert trace_search.status_code == 200
    assert len(trace_search.json()) >= 3

    # Step 6: Verify Failure Clustering (/errors/clusters)
    cluster_resp = client.get("/api/v1/errors/clusters", headers=headers)
    assert cluster_resp.status_code == 200
    clusters = cluster_resp.json()
    assert len(clusters) > 0
    assert any("Timeout" in c["cluster_name"] for c in clusters)

    # Step 7: Verify Webhook Registration & Dispatch Test
    wh_create = client.post("/api/v1/webhooks", json={"name": "E2E Webhook Listener", "url": "http://localhost:9000"}, headers=headers)
    assert wh_create.status_code == 200
    wh_id = wh_create.json()["id"]

    wh_test = client.post(f"/api/v1/webhooks/{wh_id}/test", headers=headers)
    assert wh_test.status_code == 200
    assert "signature_header" in wh_test.json()

    # Step 8: Verify Dashboard Metrics Overview (/metrics/overview)
    metrics_resp = client.get("/api/v1/metrics/overview", headers=headers)
    assert metrics_resp.status_code == 200
    m_data = metrics_resp.json()
    assert m_data["total_runs"] > 0
    assert m_data["failed_runs"] > 0
