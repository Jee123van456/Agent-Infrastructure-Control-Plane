# TylerDeck Foundation Platform Audit (`docs/FOUNDATION_AUDIT.md`)

## Executive Audit Summary
An inspection of the TylerDeck repository revealed that while the backend database models and basic router endpoints existed, the **Project, Agent, Environment, and Organization Management user workflows** were incomplete or disconnected in the frontend UI.

---

## 🔍 Request Tracing & Failure Analysis

### 1. `CREATE PROJECT` Workflow Failure Analysis
- **Frontend Path**: `apps/web/src/app/dashboard/projects/page.tsx`
- **Issue**: The "+ Create New Project" button was rendered as a static HTML element without an `onClick` event listener, modal dialog, or form state handlers.
- **API Fetch Path**: Fetch calls used `/api/v1/projects` (relative path) without prepending the API endpoint (`http://localhost:8000`), causing 404 client routing errors when NEXT_PUBLIC_API_URL rewrite was not defined.
- **State Refresh**: No state update or refetch trigger existed to update the project grid upon project creation.

### 2. `CREATE AGENT` Workflow Failure Analysis
- **Frontend Path**: Missing project detail view (`/dashboard/projects/[id]`).
- **Issue**: Managed agents inside project cards were hardcoded in JSX snippet strings ("Customer Support Agent", "Market Research Agent", "Finance Execution Agent") instead of querying `GET /api/v1/projects/{project_id}/agents`.
- **Backend Schema**: `AgentCreate` schema only accepted `name`, `description`, and `initial_version`, missing structured fields for `environment`, `framework`, `provider`, and `model`.
- **Transactional Atomicity**: `create_agent` in `projects.py` added `Agent` and `AgentVersion` with two separate commits (`db.flush()` then `db.commit()`), creating potential orphan records if version creation failed.

### 3. Missing Foundational Modules
- **Organization API**: Missing explicit `organizations.py` router for listing, creating, and updating organization details (`/api/v1/organizations`).
- **Environment Management**: Environments were stored only as plain text strings on traces rather than structured project environment entities (`development`, `staging`, `production`).
- **Project Detail Page**: Missing `/dashboard/projects/[id]` route to display project ID, description, environment tabs, agent list, and API keys.

---

## 🛠️ Required Remediation Plan
1. **Database Foundation**: Implement `Organization`, `Project`, `Environment`, `Agent`, `AgentVersion`, and `APIKey` PostgreSQL tables with referential integrity and indexes.
2. **Organization Router**: Add `apps/api/routers/organizations.py` (`POST /organizations`, `GET /organizations`, `GET /organizations/{id}`, `PATCH /organizations/{id}`).
3. **Environment Router**: Add `apps/api/routers/environments.py` (`POST /projects/{project_id}/environments`, `GET /projects/{project_id}/environments`).
4. **Project & Agent Routers**: Update `projects.py` with complete CRUD endpoints (`POST`, `GET`, `PATCH`, `DELETE` for projects and agents) with single atomic DB transactions.
5. **API Key Management**: Create API key generation UI with copy modal showing secret ONCE.
6. **Frontend State & UI**: Build interactive modals and state updates for Projects page (`/dashboard/projects`) and Project Details page (`/dashboard/projects/[id]`).
7. **End-to-End Verification**: Connect SDK, run real demo agent, and verify trace persistence in PostgreSQL and UI.
