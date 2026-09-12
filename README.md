# TYLERDECK — AGENT RELIABILITY INTELLIGENCE

> **Tagline:** *See what your agent did. Understand why it failed. Prove whether a release made it worse.*  
> **Positioning:** *Agent Reliability Intelligence for Autonomous Systems (Observe → Understand → Evaluate → Detect → Control → Improve).*  

[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-emerald.svg)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ⚡ Overview

**TylerDeck** is an Agent Reliability Intelligence platform built specifically for AI startups and engineering teams deploying autonomous agents to production using OpenAI, Anthropic Claude, Google Gemini, and custom LLM providers.

Instead of exposing raw log streams (*"Here are your 10,000 logs"*), TylerDeck turns telemetry into actionable engineering intelligence:
> *"Agent success rate dropped 7.1% after version 1.5 release. 78% of tool failures are associated with database search tool timeouts after system prompt update."*

---

## 🔥 Key Capabilities

- **Multi-Step Trajectory Tracing**: Full visual waterfall timeline capturing user inputs, observable agent execution events, LLM calls, tool executions, and outputs.
- **Provider Abstraction Layer**: Built-in pricing & usage adapters for OpenAI (GPT-4o, o1, o3-mini), Anthropic (Claude 3.5 Sonnet, Haiku), and Google Gemini (Gemini 1.5 Pro, Flash).
- **Multi-Dimensional Agent Health Scoring**: Deterministic rating combining Reliability (30%), Safety (25%), Evals (20%), Performance (15%), and Cost (10%).
- **Continuous Evaluation Datasets**: Benchmarking test suites (`eval_datasets`, `dataset_cases`, `dataset_runs`) for pre-release agent regression verification.
- **Automated Version Regression Engine**: Directly compares metric deltas across agent releases (e.g. `v1.0` vs `v1.1`), highlighting regressions in success rate, latency spikes, and cost increases.
- **Security & Action Policy Layer**: Configurable tool execution rules (`ALLOW`, `REQUIRE APPROVAL`, `BLOCK`) with risk level classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Signed Webhook Engine**: HMAC-SHA256 signed event delivery (`POST /webhooks`) for instant team notification on policy violations and performance drops.
- **Visual Agent Tool Topology**: Interactive node-and-edge visual graph (`GET /api/v1/tool-graph`) displaying call counts, latency, and failure rates per tool.
- **Fail-Open Python SDK (`tylerdeck`)**: Non-blocking background thread exporter with exponential backoff retries, explicit timeouts, and PII regex sanitization.

---

## 🚦 Feature Readiness Matrix

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Fail-Open Python SDK (`tylerdeck`)** | `Implemented` | Asynchronous background exporter thread, PII redaction, context manager & decorator support. |
| **PostgreSQL Persistence Stack** | `Implemented` | Production relational schema storing traces, events, LLM calls, tool calls, evals, and policies. |
| **Version Regression Engine** | `Implemented` | Automatic delta comparison flagging regressions across release versions. |
| **Deterministic Evaluation Engine** | `Implemented` | Multi-point automated scoring (`response_exists`, `tool_called`, `latency_limit`, `schema_valid`). |
| **Security Policy & Action Controls** | `Implemented` | Tool governance rules (`ALLOW`, `REQUIRE_APPROVAL`, `BLOCK`) with risk severity ranking. |
| **Signed Webhook Dispatcher** | `Implemented` | HMAC-SHA256 event signatures (`X-TylerDeck-Signature`) and payload delivery. |
| **Provider Telemetry & Pricing** | `Implemented` | Centralized pricing metadata engine for OpenAI, Anthropic, and Gemini. |
| **Failure Clustering & Diagnosis** | `Beta` | Automated grouping of trace failures into actionable error clusters. |
| **LLM Judge Evaluator** | `Beta` | Heuristic quality and relevance evaluation marked with `LLM JUDGE`. |
| **Agent Replay & Root-Cause Synthesis** | `Roadmap` | Planned generative root-cause analysis and trajectory replay engine. |

---

## 🏗️ Repository Architecture

```
Agent-Infrastructure-Control-Plane/
├── apps/
│   ├── api/                  # FastAPI Backend Engine (Python)
│   │   ├── providers/        # Provider Adapters (OpenAI, Anthropic, Gemini)
│   │   ├── routers/          # Auth, Projects, Traces, Metrics, Regressions, Errors, Policies, Evals, Datasets, Webhooks, Tool Graph
│   │   ├── main.py           # FastAPI entrypoint, health checks & CORS setup
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic data validation schemas
│   │   ├── auth.py           # JWT & SHA-256 API key hashing
│   │   ├── health_engine.py  # Multi-Dimensional Agent Health Scoring Engine
│   │   ├── eval_engine.py    # Deterministic & Judge Evaluation scoring
│   │   ├── regression_engine.py # Version regression diff detector
      └── policy_engine.py  # Security action policy engine
│   └── web/                  # Next.js 14 Command Center Dashboard (TypeScript / Tailwind CSS)
│       ├── src/app/          # App Router (Overview, Traces, Tool Graph, Regressions, Datasets, Evals, Cost, Security, Alerts)
│       └── src/components/   # Navbar, Footer, UI components
├── sdk/
│   └── python/               # tylerdeck Python package
│       └── tylerdeck/        # Client, @td.trace decorator, Async exporter with retries, Redactor
├── database/
│   └── seed.py               # PostgreSQL seed script with realistic agent traces
├── examples/                 # Real local demo agents and provider integrations
├── docs/                     # Technical specifications, DEMO guide, audit reports
├── docker/                   # Dockerfile.api & Dockerfile.web
├── docker-compose.yml        # Orchestration (API + Web + PostgreSQL)
└── README.md
```

---

## 🚀 Quickstart Guide (Local Setup)

### 1. Start Database & Seed Data
```bash
# Seed PostgreSQL database (uses default local postgres on 5433 or Docker container)
DATABASE_URL="postgresql://tylerdeck:tylerdeckpass@localhost:5433/tylerdeckdb" python3 database/seed.py
```

### 2. Start Backend API Server
```bash
python3 -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Start Next.js Command Center Dashboard
```bash
cd apps/web
npm install
npm run dev
```
Dashboard will be live at: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

To launch the complete production stack (FastAPI Backend + Next.js Dashboard + PostgreSQL) with a single command:

```bash
docker compose up --build
```

---

## 🔑 Demo Credentials & Test Key

- **User Login Email**: `alex@acmeai.com`
- **User Password**: `password123`
- **SDK Demo API Key**: `td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c`

---

## 🧪 Automated Testing

Run the full pytest integration & unit test suite:

```bash
DATABASE_URL="postgresql://tylerdeck:tylerdeckpass@localhost:5433/tylerdeckdb" pytest apps/api/tests/
```

---

## 📜 Documentation Index

- [Step-by-Step 10-Minute Demo Guide](docs/DEMO.md)
- [Phase 3 Audit Report](docs/PHASE3_AUDIT.md)
- [Phase 3 Final Status & Verification](docs/PHASE3_FINAL_STATUS.md)
- [Technical Codebase Audit](docs/TECHNICAL_AUDIT.md)
- [Market Research & Competitor Analysis](docs/MARKET_RESEARCH.md)
- [Architecture Specification](docs/ARCHITECTURE.md)
- [Security Specification](docs/SECURITY.md)
- [API Reference](docs/API.md)
- [Python SDK Guide](docs/SDK.md)

---

## 📄 License

[MIT License](LICENSE) © 2026 TylerDeck Inc.
