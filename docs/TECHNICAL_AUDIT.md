# TylerDeck — Technical Codebase Audit & Gap Analysis

**Date:** September 11, 2026  
**Target Project:** TylerDeck (Agent-Infrastructure-Control-Plane)  
**Positioning:** The Production Control Plane for AI Agents  

---

## Executive Summary

An exhaustive technical audit was conducted on the TylerDeck codebase. The system possesses a solid, high-performance foundation built on **Python 3.14 / FastAPI / SQLAlchemy** for the backend, **Next.js 14 / TypeScript / Tailwind CSS** for the dashboard, and a lightweight, fail-open **Python SDK (`tylerdeck`)**.

This document outlines:
1. What currently works cleanly
2. Technical gaps and partial implementations
3. Security vulnerabilities (including IDOR risks)
4. Recommended improvements prioritized by urgency (P0, P1, P2, P3)

---

## 1. Audit Findings by System Component

### 1.1 Backend Architecture (`apps/api/`)
* **Framework:** FastAPI with Uvicorn.
* **Database & ORM:** SQLAlchemy 2.0 with SQLite default (`tylerdeck.db`) and PostgreSQL production compatibility.
* **Authentication:** JWT tokens signed via `jose.jwt` using SHA-256 salted password hashes (`auth.py`).
* **API Key System:** Secure `td_live_...` prefix-based API keys hashed with SHA-256 before database storage.
* **Routers Present:** `auth`, `projects`, `traces`, `metrics`, `regressions`, `errors`, `policies`, `evaluations`, `alerts`.
* **Strengths:** Clean router modularity, fast query execution, automated table creation on boot.
* **Gaps / Issues:**
  - **[P0 - Security] IDOR Risks:** Sub-resource endpoints in `projects.py` (such as `/projects/agents/{agent_id}/versions`, `/projects/{project_id}/api-keys`, `/projects/api-keys/{key_id}`) and `policies.py`, `alerts.py`, `evaluations.py` did not consistently verify that target IDs belong to `current_user.organization_id`.
  - **[P0 - Code Quality] Deprecated Datetime:** `datetime.utcnow()` used across models and routers causes Python 3.14 deprecation warnings.
  - **[P1 - Architecture] Provider Coupling:** LLM pricing and usage calculations were tied directly to inline functions in `pricing.py` without a formal provider adapter abstraction.

---

### 1.2 Frontend Architecture (`apps/web/`)
* **Framework:** Next.js 14 App Router with Tailwind CSS & TypeScript.
* **Data Visualization:** Recharts for spend breakdown, latency distribution, and run charts.
* **Icons & Aesthetics:** Lucide React icons, dark charcoal Vercel/Linear-inspired command center styling.
* **Pages Present:** Overview Dashboard, Traces List, Trace Detail Waterfall, Version Regressions, Error Clusters, Security & Policies, Evals, Alerts, API Keys, Settings, Landing/Product/Docs pages.
* **Strengths:** Responsive layout, rich data density, dark mode aesthetic.
* **Gaps / Issues:**
  - **[P1 - UX] Missing Visual Tool Graph:** Lacks an interactive visual graph representation of agent-to-tool relationships.
  - **[P1 - Evals] Static Evals:** Evals UI displays trace evals but lacks an explicit dataset runner & benchmarking interface.

---

### 1.3 Python SDK (`sdk/python/tylerdeck/`)
* **Core Components:** `TylerDeck` client, `@td.trace` decorator, `with td.trace()` context manager, `AsyncTraceExporter` background thread worker, `sanitize_data` PII redactor.
* **Strengths:** Fail-open architecture (telemetry failures never crash host agent code), non-blocking background queue.
* **Gaps / Issues:**
  - **[P1 - SDK Reliability] Timeout & Retry Configuration:** Exporter worker lacks explicit configurable timeouts and exponential backoff retry policies for unreliable network conditions.

---

### 1.4 Database Schema (`database/`)
* **Tables:** `users`, `organizations`, `projects`, `agents`, `agent_versions`, `api_keys`, `traces`, `trace_events`, `llm_calls`, `tool_calls`, `evaluations`, `policies`, `policy_violations`, `alerts`, `alert_events`, `model_pricing`.
* **Strengths:** Indexed UUID primary keys, foreign key cascades, JSONB/JSON column metadata.
* **Gaps / Issues:**
  - **[P1 - Schema Expansion] Missing Datasets & Webhooks:** Needs `eval_datasets`, `dataset_cases`, `webhooks`, and `webhook_logs` tables to support continuous regression testing and signed alert notifications.

---

## 2. Comprehensive Gap Analysis Matrix

| ID | Issue / Feature Gap | Component | Impact | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | IDOR vulnerability on agent versions, API keys, policies, alerts | Backend Routers | High Security Risk | **P0** | Action Required |
| **SEC-02** | Python 3.14 `datetime.utcnow()` deprecation warnings | Backend / Seed | Code Quality | **P0** | Action Required |
| **ENG-01** | Missing LLM Provider Abstraction (`LLMProvider`, `OpenAIProvider`, `AnthropicProvider`, `GeminiProvider`) | Backend Engine | Modular Architecture | **P1** | Action Required |
| **ENG-02** | Missing Multi-Dimensional Agent Health Score System (0-100 rating) | Backend Engine | Differentiated UX | **P1** | Action Required |
| **ENG-03** | Missing Evaluation Datasets & Benchmarking Runner Engine | Backend Engine | Regression Testing | **P1** | Action Required |
| **ENG-04** | Missing Signed Webhook Delivery System (HMAC signature verification) | Backend Engine | Integrations | **P1** | Action Required |
| **ENG-05** | Missing Visual Agent Tool Graph API & Dashboard Component | Backend & Frontend | Visual Differentiation | **P1** | Action Required |
| **SDK-01** | SDK worker lacks configurable HTTP timeouts and exponential backoff retries | Python SDK | SDK Reliability | **P1** | Action Required |

---

## 3. Action Plan & Priority Order

1. **P0 Tasks:**
   - Enforce strict `organization_id` ownership verification across all backend routers.
   - Replace all `datetime.utcnow()` instances with timezone-aware `datetime.now(timezone.utc)`.
   - Audit `.env.example` and remove any real credential placeholders.

2. **P1 Tasks:**
   - Implement `apps/api/providers/` (OpenAI, Anthropic, Gemini adapters).
   - Implement Multi-Dimensional Agent Health Scoring Engine.
   - Implement Continuous Evaluation Datasets & Test Cases Engine.
   - Implement Signed Webhook Notification Engine.
   - Implement Visual Agent Tool Graph API & UI component.
   - Enhance Python SDK (`tylerdeck`) with exponential backoff and timeout handling.

3. **P2/P3 Tasks:**
   - Expand documentation suite (`MARKET_RESEARCH.md`, `SECURITY.md`, `PRODUCT_REQUIREMENTS.md`, `FINAL_STATUS.md`).
