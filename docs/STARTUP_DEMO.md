# 🚀 TylerDeck Startup Module 01 — Demonstration Guide

**Positioning:** *AGENT RELIABILITY INTELLIGENCE — Connect your agent in minutes. See what happened. See what failed. Measure cost. Detect when a release became worse.*

---

## ⏱️ Demonstration Overview (< 10 Minutes)

This step-by-step walkthrough demonstrates how an AI engineering team onboard their agent to TylerDeck, generate API keys, instrument trace trajectories, inspect execution trees, evaluate trace performance, cluster failure patterns, detect version regressions, and enforce security policies.

---

## 📋 Prerequisites & Setup

1. **Start TylerDeck Production Stack**:
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

2. **Access Points**:
   - Agent Connection Wizard: [http://localhost:3000/connect-agent](http://localhost:3000/connect-agent)
   - Command Center Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Failure Clusters: [http://localhost:3000/dashboard/failures](http://localhost:3000/dashboard/failures)
   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Readiness Probe: `curl http://localhost:8000/ready`

---

## 🎬 10-Minute Demonstration Steps

### Step 1: Start TylerDeck & User Sign In (0:00 - 1:00)
- Navigate to `http://localhost:3000/login`
- Log in with credentials:
  - **Email**: `alex@acmeai.com`
  - **Password**: `password123`

### Step 2: Customer Onboarding Wizard (1:00 - 2:30)
- Navigate to **Agent Connection Wizard** at `http://localhost:3000/connect-agent`.
- **Step 1**: Choose SDK Language -> `Python`
- **Step 2**: Choose LLM Provider -> `OpenAI` / `Anthropic` / `Gemini`
- **Step 3**: Copy SDK Installation (`pip install tylerdeck`)
- **Step 4**: Copy tailored code instrumentation snippet
- **Step 5**: Click **Verify Test Trace Arrival**
- **Step 6**: Confirm live status badge: `✓ YOUR FIRST AI AGENT IS CONNECTED`

### Step 3: Run Demo Agent — SUCCESS Scenario (2:30 - 4:00)
- In terminal, execute the real Customer Support Agent:
  ```bash
  python3 examples/customer_support_agent.py --scenario success
  ```
- Open **Trace Explorer** (`/dashboard/traces`).
- Open trace `customer_support_inquiry`.
- **Inspect**:
  - Waterfall Execution Tree: `User Question` -> `LLM` -> `Customer DB` -> `Order API` -> `LLM` -> `Response`
  - Total Duration: ~1.1s
  - Total Cost: Calculated via centralized pricing engine
  - Evaluation Card: 90+ Score (`Task Completion`, `Tool Correctness`, `Safety`).

### Step 4: Run Demo Agent — FAILURE Scenario (4:00 - 5:30)
- Execute the Customer Support Agent in failure mode (forces Order API timeout):
  ```bash
  python3 examples/customer_support_agent.py --scenario failure
  ```
- Refresh **Trace Explorer** (`/dashboard/traces`).
- Open the failing trace `customer_support_inquiry` (`v1.1`).
- **Inspect**:
  - Status: `ERROR`
  - Failing Tool: `Order API` highlighted in red with status `TIMEOUT`
  - Error Details: `Tool execution 'order_api' timed out after 5000ms`.

### Step 5: Failure Clusters Console (5:30 - 7:00)
- Navigate to **Failure Intelligence** (`/dashboard/failures`).
- **Inspect Cluster**:
  - Cluster Category: **Tool Timeout (TOOL_TIMEOUT)**
  - Affected Agent: `Customer Support Agent`
  - Affected Version: `v1.1`
  - Affected Tool: `order_api`
  - Occurrences & Representative Trace Link.

### Step 6: Version Regression Detection (7:00 - 8:30)
- Navigate to **Version Regressions** (`/dashboard/regressions`).
- View the comparison between `v1.0` and `v1.1`.
- **Inspect**:
  - Flag: `🚨 REGRESSION DETECTED`
  - Success Rate: `90.0% (v1.0)` → `70.0% (v1.1)` (-20.0% delta)
  - Contributing Signals: Order API timeout failures concentrated in v1.1.

### Step 7: Security Policy & Tool Topology (8:30 - 10:00)
- Run the Security Policy Agent:
  ```bash
  python3 examples/security_policy_agent.py
  ```
- Navigate to **Security & Policies** (`/dashboard/security`).
- Inspect policy decision for `payment_api`: `BLOCKED / PENDING APPROVAL`.
- Navigate to **Tool Topology** (`/dashboard/tool-graph`) to view interactive call counts, latency, and risk nodes per tool.

---

## 🎯 Verification Conclusion

This completes the 10-minute TylerDeck Startup Module 01 demonstration, proving that any AI engineering team can connect their agent in minutes, observe trajectories, evaluate quality, measure cost, detect failures, and isolate version regressions.
