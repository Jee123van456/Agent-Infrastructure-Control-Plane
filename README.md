# TYLERDECK — PRODUCTION CONTROL PLANE FOR AI AGENTS

> **Tagline:** *Observe. Evaluate. Secure. Ship AI Agents.*  
> **Positioning:** *The Production Control Plane for AI Agents (Observe → Understand → Evaluate → Detect → Control → Improve).*  

[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-emerald.svg)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ⚡ Overview

**TylerDeck** is a developer-first AI agent control plane built specifically for AI startups and engineering teams (2–50 employees) deploying autonomous agents to production using OpenAI, Anthropic Claude, Google Gemini, and custom LLM providers.

Instead of exposing raw log streams (*"Here are your 10,000 logs"*), TylerDeck turns telemetry into actionable engineering intelligence:
> *"Agent success rate dropped 7.1% after version 1.5 release. 78% of tool failures are associated with database search tool timeouts after system prompt update."*

---

## 🔥 Key Capabilities

- **Multi-Step Trajectory Tracing**: Full visual waterfall timeline capturing user inputs, agent thoughts, LLM calls, tool executions, and outputs.
- **Provider Abstraction Layer**: Built-in pricing & usage adapters for OpenAI (GPT-4o, o1, o3-mini), Anthropic (Claude 3.5 Sonnet, Haiku), and Google Gemini (Gemini 1.5 Pro, Flash).
- **Multi-Dimensional Agent Health Scoring**: Deterministic 0-100 rating combining Reliability (30%), Safety (25%), Evals (20%), Performance (15%), and Cost (10%).
- **Continuous Evaluation Datasets**: Benchmarking test suites (`eval_datasets`, `dataset_cases`, `dataset_runs`) for pre-release agent regression verification.
- **Automated Version Regression Engine**: Directly compares metric deltas across agent releases (e.g. `v1.4` vs `v1.5`), highlighting regressions in success rate, latency spikes, and cost increases.
- **Security & Action Policy Layer**: Configurable tool execution rules (`ALLOW`, `REQUIRE APPROVAL`, `BLOCK`) with risk level classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Signed Webhook Engine**: HMAC-SHA256 signed event delivery (`POST /webhooks`) for instant team notification on policy violations and performance drops.
- **Visual Agent Tool Topology**: Interactive node-and-edge visual graph (`GET /api/v1/tool-graph`) displaying call counts, latency, and failure rates per tool.
- **Fail-Open Python SDK (`tylerdeck`)**: Non-blocking background thread exporter with exponential backoff retries, explicit timeouts, and PII regex sanitization.

---

## 🏗️ Repository Architecture

```
Agent-Infrastructure-Control-Plane/
├── apps/
│   ├── api/                  # FastAPI Backend Engine (Python)
│   │   ├── providers/        # Provider Adapters (OpenAI, Anthropic, Gemini)
│   │   ├── routers/          # Auth, Projects, Traces, Metrics, Regressions, Errors, Policies, Evals, Datasets, Webhooks, Tool Graph
│   │   ├── main.py           # FastAPI entrypoint & CORS setup
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic data validation schemas
│   │   ├── auth.py           # JWT & SHA-256 API key hashing (Multi-Tenant IDOR Guard)
│   │   ├── health_engine.py  # Multi-Dimensional Agent Health Scoring Engine
│   │   ├── eval_engine.py    # Deterministic & Judge Evaluation scoring
│   │   ├── regression_engine.py # Version regression diff detector
│   │   └── policy_engine.py  # Security action policy engine
│   └── web/                  # Next.js 14 Command Center Dashboard (TypeScript / Tailwind CSS)
│       ├── src/app/          # App Router (Overview, Traces, Tool Graph, Regressions, Datasets, Evals, Cost, Security, Alerts)
│       └── src/components/   # Navbar, Footer, UI components
├── sdk/
│   └── python/               # tylerdeck Python package
│       └── tylerdeck/        # Client, @td.trace decorator, Async exporter with retries, Redactor
├── database/
│   ├── seed.py               # Seed script with realistic production agent traces
│   └── tylerdeck.db          # Local SQLite database
├── docs/                     # Comprehensive technical documentation & audit reports
├── docker/                   # Dockerfile.api & Dockerfile.web
├── docker-compose.yml        # Orchestration (API + Web + Database)
└── README.md
```

---

## 🚀 Quickstart Guide (Local Setup)

### 1. Clone & Seed Database
```bash
git clone https://github.com/Jee123van456/Agent-Infrastructure-Control-Plane.git
cd Agent-Infrastructure-Control-Plane

# Install API dependencies & seed database
pip install fastapi uvicorn pydantic sqlalchemy passlib python-jose python-multipart requests email-validator pytest
python3 database/seed.py
```

### 2. Start Backend API Server
```bash
python3 -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Start Next.js Control Center Dashboard
```bash
cd apps/web
npm install
npm run dev
```
Dashboard will be live at: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

To launch the complete production stack (FastAPI Backend + Next.js Dashboard) with a single command:

```bash
docker compose up --build
```

---

## 🔑 Demo Credentials & Test Key

- **User Login Email**: `alex@acmeai.com`
- **User Password**: `password123`
- **SDK Production API Key**: `td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c`

---

## 🧪 Automated Testing

Run the full pytest integration & unit test suite:

```bash
pytest apps/api/tests/test_api.py
```

---

## 📜 Documentation Index

- [Technical Codebase Audit](docs/TECHNICAL_AUDIT.md)
- [Market Research & Competitor Analysis](docs/MARKET_RESEARCH.md)
- [Final Status & Production Readiness](docs/FINAL_STATUS.md)
- [Architecture Specification](docs/ARCHITECTURE.md)
- [Product Requirements](docs/PRODUCT.md)
- [Security Specification](docs/SECURITY.md)
- [API Reference](docs/API.md)
- [Python SDK Guide](docs/SDK.md)
- [Future Roadmap](docs/ROADMAP.md)

---

## 📄 License

[MIT License](LICENSE) © 2026 TylerDeck Inc.
