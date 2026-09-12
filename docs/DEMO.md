# 🚀 TylerDeck 10-Minute Demonstration Guide

**Positioning:** *Agent Reliability Intelligence — See what your agent did. Understand why it failed. Prove whether a release made it worse.*

---

## ⏱️ Demonstration Overview (< 10 Minutes)

This step-by-step walkthrough demonstrates how TylerDeck tracks autonomous agent execution end-to-end, performs deterministic evaluations, detects release version regressions, clusters failure patterns, enforces tool security policies, and dispatches signed webhooks using REAL application logic.

---

## 📋 Prerequisites & Setup

1. **Start TylerDeck Services**:
   ```bash
   docker compose up --build
   ```
   Or locally:
   ```bash
   # Terminal 1 (Backend API):
   DATABASE_URL="postgresql://tylerdeck:tylerdeckpass@localhost:5433/tylerdeckdb" python3 database/seed.py
   python3 -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000

   # Terminal 2 (Command Center Dashboard):
   cd apps/web && npm run dev
   ```

2. **Access Interfaces**:
   - Command Center Dashboard: [http://localhost:3000](http://localhost:3000)
   - API OpenAPI Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Readiness Probe: `curl http://localhost:8000/ready`

---

## 🎬 Step-by-Step Demonstration Sequence

### Step 1: Login & Project Navigation (0:00 - 1:00)
- Navigate to `http://localhost:3000/login`
- Log in with credentials:
  - **Email**: `alex@acmeai.com`
  - **Password**: `password123`
- Inspect the **Overview Dashboard** showing total runs, success rate, cost, latency p95, active alerts, and failure clusters.

### Step 2: SDK API Key Verification (1:00 - 1:30)
- Go to **API Keys** (`/dashboard/api-keys`).
- Verify active test key prefix: `td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c`.

---

### Step 3: Run Scenario A — SUCCESS (1:30 - 3:00)
- Execute the Customer Support Agent in Success mode:
  ```bash
  python3 examples/customer_support_agent.py --scenario success
  ```
- **Observed Flow**:
  - `User Question` -> `LLM (GPT-4o-mini)` -> `Customer Database` -> `Order API` -> `LLM (GPT-4o)` -> `Final Response`
- Navigate to **Trace Explorer** (`/dashboard/traces`).
- Click on the new trace `customer_support_inquiry`.
- **Verify**:
  - Status: `SUCCESS`
  - Total Duration: ~1.1s
  - Total Cost: Calculated via centralized pricing engine
  - Waterfall Timeline: Expandable event nodes showing inputs, outputs, token breakdown, and tool status.
  - Evaluation Card: Scores 90+ across Task Completion, Tool Correctness, Safety, and Quality.

---

### Step 4: Run Scenario B — FAILURE (3:00 - 4:30)
- Execute the Customer Support Agent in Failure mode (forces Order API timeout):
  ```bash
  python3 examples/customer_support_agent.py --scenario failure
  ```
- **Observed Flow**:
  - `User Question` -> `LLM` -> `Customer Database` -> `Order API (TIMEOUT)` -> `Trace ERROR`
- Open **Trace Explorer** and refresh.
- Click the failing trace `customer_support_inquiry` (v1.1).
- **Verify**:
  - Status: `ERROR`
  - Error Details: `Tool execution 'order_api' timed out after 5000ms`
  - Event Node: `Order API` node highlighted in red with status `TIMEOUT`.

---

### Step 5: Failure Cluster & Actionable Diagnosis (4:30 - 6:00)
- Navigate to **Error Intelligence / Failure Clusters** (`/dashboard/errors`).
- Observe the automatically generated cluster: **Tool Timeout (TOOL_TIMEOUT)**.
- Click the cluster to inspect **Actionable Diagnosis**:
  - **What failed**: Order API execution timeout (5000ms threshold)
  - **Where**: `Customer Support Agent` -> `v1.1` -> `order_api`
  - **Frequency**: 3 occurrences (~30% failure rate)
  - **Evidence**: Representative trace ID linked directly.

---

### Step 6: Version Regression Detection (6:00 - 7:30)
- Navigate to **Version Regressions** (`/dashboard/regressions`).
- View the comparison between `v1.0` (Baseline) and `v1.1` (New Release).
- **Verify Automatic Regression Flag**:
  - `🚨 REGRESSION DETECTED`
  - Success Rate: `90.0% (v1.0)` → `70.0% (v1.1)` (Delta -20.0%)
  - Primary Affected Tool: `order_api`
  - Primary Cause: Increased external API timeout errors.

---

### Step 7: Security Policy & Webhook Verification (7:30 - 9:00)
- Execute the Security Policy Agent:
  ```bash
  python3 examples/security_policy_agent.py
  ```
- Navigate to **Security & Policies** (`/dashboard/security`).
- Inspect policy event:
  - Tool: `payment_api`
  - Risk Level: `HIGH`
  - Policy Rule: `REQUIRE_APPROVAL`
  - Decision: `BLOCKED / PENDING APPROVAL`
- Start local Webhook Receiver and test webhook dispatch:
  ```bash
  python3 examples/webhook_receiver.py &
  curl -X POST "http://localhost:8000/api/v1/webhooks/wh_test_1/test" -H "Authorization: Bearer alex@acmeai.com"
  ```
- **Verify**: HMAC-SHA256 signature in `X-TylerDeck-Signature` verified cleanly by receiver.

---

### Step 8: Visual Tool Graph Topology (9:00 - 10:00)
- Navigate to **Tool Topology Graph** (`/dashboard/tool-graph`).
- Observe the interactive node-and-edge visual graph (`GET /api/v1/tool-graph`).
- Nodes display call counts, average latency, and failure rates per tool (`customer_database`, `order_api`, `payment_api`, `web_search`).

---

## 🎯 Conclusion

This completes the 10-minute TylerDeck demonstration, proving that TylerDeck is a fully functional, production-credible **Agent Reliability Intelligence** control plane.
