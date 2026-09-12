import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def create_user_and_login(email="user_a@org-a.com", password="password123", full_name="User A", org_name="Org A"):
    res = client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": password,
        "full_name": full_name,
        "organization_name": org_name
    })
    if res.status_code == 400 and "already exists" in res.text:
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_project_crud():
    headers = create_user_and_login("founder@acme.com", "pass12345", "Founder", "Acme Corp")
    
    # 1. Create Project
    create_res = client.post("/api/v1/projects", headers=headers, json={
        "name": "Acme Support System",
        "description": "Customer support automation workspace"
    })
    assert create_res.status_code == 200
    proj_data = create_res.json()
    assert proj_data["name"] == "Acme Support System"
    proj_id = proj_data["id"]

    # 2. Get Project Detail
    detail_res = client.get(f"/api/v1/projects/{proj_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == proj_id
    assert len(detail["environments"]) == 3  # development, staging, production auto-created

    # 3. List Projects
    list_res = client.get("/api/v1/projects", headers=headers)
    assert list_res.status_code == 200
    assert any(p["id"] == proj_id for p in list_res.json())

def test_agent_and_version_creation():
    headers = create_user_and_login("founder@acme.com", "pass12345", "Founder", "Acme Corp")
    proj_res = client.get("/api/v1/projects", headers=headers)
    proj_id = proj_res.json()[0]["id"]

    # Create Agent
    agent_res = client.post(f"/api/v1/projects/{proj_id}/agents", headers=headers, json={
        "name": "Refund Automation Bot",
        "description": "Autonomous bot for refund processing",
        "environment": "staging",
        "provider": "anthropic",
        "model": "claude-3-5-sonnet",
        "initial_version": "v1.0.0"
    })
    assert agent_res.status_code == 200
    agent_data = agent_res.json()
    assert agent_data["name"] == "Refund Automation Bot"
    assert agent_data["current_version"] == "v1.0.0"
    agent_id = agent_data["id"]

    # Verify initial version v1.0.0 exists
    ver_res = client.get(f"/api/v1/agents/{agent_id}/versions", headers=headers)
    assert ver_res.status_code == 200
    versions = ver_res.json()
    assert len(versions) >= 1
    assert versions[0]["version"] == "v1.0.0"

def test_api_key_generation_and_hashing():
    headers = create_user_and_login("founder@acme.com", "pass12345", "Founder", "Acme Corp")
    proj_res = client.get("/api/v1/projects", headers=headers)
    proj_id = proj_res.json()[0]["id"]

    # Generate API Key
    key_res = client.post(f"/api/v1/projects/{proj_id}/api-keys", headers=headers, json={
        "name": "Integration Test Key",
        "environment": "development font"
    })
    assert key_res.status_code == 200
    key_data = key_res.json()
    assert "raw_key" in key_data
    assert key_data["raw_key"].startswith("td_test_")
    assert key_data["key_prefix"].startswith("td_test_")

def test_organization_isolation_security():
    """
    CRITICAL SECURITY TEST:
    User A (Org A) MUST NOT access Org B's projects. Returns 404 or 403.
    """
    headers_a = create_user_and_login("user_a@orga.com", "pass12345", "User A", "Org A")
    headers_b = create_user_and_login("user_b@orgb.com", "pass12345", "User B", "Org B")

    # User A creates project
    proj_res_a = client.post("/api/v1/projects", headers=headers_a, json={
        "name": "Org A Secret Project"
    })
    assert proj_res_a.status_code == 200
    proj_id_a = proj_res_a.json()["id"]

    # User B attempts to access Org A's project
    forbidden_res = client.get(f"/api/v1/projects/{proj_id_a}", headers=headers_b)
    assert forbidden_res.status_code in [403, 404], f"Org B accessed Org A's project! Status: {forbidden_res.status_code}"
