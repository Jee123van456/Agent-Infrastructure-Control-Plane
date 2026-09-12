import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def get_auth_headers(email="alex@acmeai.com", password="password123"):
    login_resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_sessions_api():
    headers = get_auth_headers()
    res = client.get("/api/v1/sessions", headers=headers)
    assert res.status_code == 200
    sessions = res.json()
    assert isinstance(sessions, list)
    assert len(sessions) > 0
    assert "trace_count" in sessions[0]

def test_prompts_api():
    headers = get_auth_headers()
    # List prompts
    res = client.get("/api/v1/prompts", headers=headers)
    assert res.status_code == 200
    prompts = res.json()
    assert len(prompts) > 0

    # Create new prompt
    create_res = client.post("/api/v1/prompts", headers=headers, json={
        "name": "Ecosystem Test Prompt",
        "description": "Prompt for testing ecosystem workflow",
        "initial_content": "Analyze query {{query}} with care.",
        "variables": ["query"]
    })
    assert create_res.status_code == 200
    prompt_id = create_res.json()["id"]

    # Create version
    ver_res = client.post(f"/api/v1/prompts/{prompt_id}/versions", headers=headers, json={
        "version": "v2.0",
        "content": "Analyze query {{query}} with high accuracy.",
        "variables": ["query"],
        "environment_label": "staging"
    })
    assert ver_res.status_code == 200
    assert ver_res.json()["version"] == "v2.0"

def test_playground_api():
    headers = get_auth_headers()
    res = client.post("/api/v1/playground/run", headers=headers, json={
        "prompt_content": "Summarize customer issue: {issue}",
        "input_variables": {"issue": "Order payment failed on checkout"},
        "model": "gpt-4o",
        "provider": "openai",
        "temperature": 0.5
    })
    assert res.status_code == 200
    data = res.json()
    assert "response_text" in data
    assert data["latency_ms"] > 0
    assert data["cost_usd"] >= 0

def test_experiments_api():
    headers = get_auth_headers()
    # Get existing dataset ID
    ds_res = client.get("/api/v1/datasets", headers=headers)
    assert ds_res.status_code == 200
    datasets = ds_res.json()
    assert len(datasets) > 0
    ds_id = datasets[0]["id"]

    # Create experiment
    exp_res = client.post("/api/v1/experiments", headers=headers, json={
        "name": "Automated Ecosystem Experiment",
        "description": "Testing Candidate A vs Candidate B",
        "dataset_id": ds_id,
        "candidates": [
            {"candidate_label": "Candidate A (GPT-4o-mini)", "model": "gpt-4o-mini", "provider": "openai"},
            {"candidate_label": "Candidate B (Claude 3.5 Sonnet)", "model": "claude-3-5-sonnet", "provider": "anthropic"}
        ]
    })
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert len(exp_data["candidates"]) == 2
    assert len(exp_data["runs"]) > 0

def test_feedback_and_convert_api():
    headers = get_auth_headers()
    # Fetch a trace ID
    trace_res = client.get("/api/v1/traces", headers=headers)
    assert trace_res.status_code == 200
    traces = trace_res.json()
    assert len(traces) > 0
    trace_id = traces[0]["id"]

    # Submit feedback
    fb_res = client.post("/api/v1/feedback", headers=headers, json={
        "trace_id": trace_id,
        "feedback_type": "thumbs_up",
        "rating_value": 5.0,
        "comment": "Great automated response!"
    })
    assert fb_res.status_code == 200

    # Submit human annotation
    ann_res = client.post("/api/v1/feedback/annotations", headers=headers, json={
        "trace_id": trace_id,
        "quality_score": 95.0,
        "correctness_score": 98.0,
        "relevance_score": 94.0,
        "safety_score": 100.0,
        "notes": "Verified by lead engineer"
    })
    assert ann_res.status_code == 200

    # Convert trace to dataset
    ds_res = client.get("/api/v1/datasets", headers=headers)
    ds_id = ds_res.json()[0]["id"]

    conv_res = client.post(f"/api/v1/feedback/convert-to-dataset?trace_id={trace_id}&dataset_id={ds_id}", headers=headers)
    assert conv_res.status_code == 200
    assert conv_res.json()["status"] == "success"
