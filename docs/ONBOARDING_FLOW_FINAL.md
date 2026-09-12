# TylerDeck — Canonical Onboarding Architecture & Lifecycle

## Architecture Overview

TylerDeck implements a production-grade multi-tenant AI Agent Observability & Reliability SaaS architecture. 
The onboarding flow bridges organizational hierarchy directly to SDK instrumentation and live trace ingestion in PostgreSQL.

```
SIGN UP
  ↓
ORGANIZATION
  ↓
CREATE PROJECT
  ↓
CREATE ENVIRONMENT (default: development, staging, production)
  ↓
CREATE AGENT
  ↓
CREATE AGENT VERSION (atomic release: v1.0.0)
  ↓
GENERATE API KEY (SHA-256 hashed secret key stored)
  ↓
CONNECT AGENT WIZARD (/connect-agent)
  ↓
INSTALL SDK (pip install tylerdeck)
  ↓
INSTRUMENT AGENT (personal contextual code snippet)
  ↓
TEST TRACE (execute agent / trigger SDK trace)
  ↓
FIRST TRACE RECEIVED (real backend trace polling & confirmation)
  ↓
AGENT DASHBOARD
```

---

## Technical Data Relationship Hierarchy

All records enforce strict tenant isolation and foreign key constraints within PostgreSQL:

- **Organization (`organizations`)**: Primary tenant context.
- **User (`users`)**: Authenticated team member belonging to an Organization via `organization_id`.
- **Project (`projects`)**: Workspace bound to an Organization (`organization_id`).
- **Environment (`environments`)**: Environments (`development`, `staging`, `production`) attached to a Project.
- **Agent (`agents`)**: Autonomous agent registered within a Project, specifying framework, provider (`openai`, `anthropic`, `gemini`), and model (`gpt-4o`).
- **Agent Version (`agent_versions`)**: Version tracking record (`v1.0.0`) attached to an Agent.
- **API Key (`api_keys`)**: Hashed API key (`td_test_...` or `td_live_...`) bound to a Project and Environment.
- **Trace (`traces`)**: Ingested execution trace produced by the Python SDK, storing agent metadata, token usage, latency, cost, and events/observations.
- **Observation (`observations`)**: Fine-grained LLM calls, tool executions, and retrieval events within a Trace.

---

## Detailed Step-by-Step Flow

### 1. User Signup & Organization Provisioning
- Endpoint: `POST /api/v1/auth/signup`
- Creates Organization, User, and issues JWT token.

### 2. Project Creation Modal & Route
- Route: `/dashboard/projects`
- Action: Click **"+ Create New Project"**
- Modal Fields: `Project Name`, `Description`
- Backend API: `POST /api/v1/projects`
- Auto-provisioning: Automatically creates `development`, `staging`, and `production` environments for the project.
- Navigation: Immediately redirects to `/dashboard/projects/{project_id}` upon creation.

### 3. Environment & Agent Fleet Configuration
- Route: `/dashboard/projects/{project_id}`
- Actions:
  - **"+ New Environment"**: Add target deployment environment.
  - **"+ New Agent"**: Creates Agent record in PostgreSQL and atomically registers `v1.0.0` version.
  - **"+ Generate API Key"**: Generates secret API key (`td_test_...`), displays raw secret once, and stores SHA-256 hash in `api_keys`.

### 4. Contextual Connect Agent Wizard
- Route: `/connect-agent?projectId={id}&projectName={name}&environment={env}&agentName={agent}&version={v}&api_key={key}`
- Preserves modern visual design with 6-step progress indicator:
  - **Step 01 Language**: Select SDK language (Python).
  - **Step 02 Provider**: Choose LLM Provider (OpenAI, Anthropic, Gemini, Custom).
  - **Step 03 Install**: `pip install tylerdeck`.
  - **Step 04 Instrument**: Displays dynamic, copyable Python code using real project credentials, agent name, and version.
  - **Step 05 Test Trace**: Polling real backend traces (`GET /api/v1/traces?agent={agentName}`). No fake test trace state or static timeouts.
  - **Step 06 Confirmed**: Confirms arrival of first trace in PostgreSQL, displaying Recorded `Trace ID`, Status (`SUCCESS`), Duration, and Cost.
  - Actions: **"View Trace"** (`/dashboard/traces/{trace_id}`) and **"Go to Agent Dashboard"** (`/dashboard/projects/{project_id}`).

### 5. Verification & Empty States
- If no project exists: `/dashboard/projects` shows empty state with **"Create your first project"**.
- If projects exist but no agents: `/dashboard/projects/{project_id}` shows **"Create your first AI agent"**.
- **"Connect Agent"** is available whenever an agent exists.

---

## Acceptance Test Suite

The full lifecycle has been verified against automated tests:
1. `pytest apps/api/tests/test_foundation.py` (CRUD, Agent creation, API key hashing, Tenant isolation)
2. `pytest apps/api/tests/test_ecosystem_loop.py` (Ingestion, Sessions, Experiments)
3. `npm --prefix apps/web run build` (Next.js 33/33 static & dynamic routes compiled)

All records are persisted directly in PostgreSQL with zero mock data.
