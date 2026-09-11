# TYLERDECK — ADVANCED AI AGENT OBSERVABILITY & RELIABILITY PLATFORM

> **Tagline:** *Observe. Evaluate. Secure. Ship AI Agents.*  
> **Positioning:** *The Production Control Plane for AI Agents.*

---

## ⚡ Overview

**TylerDeck** is a developer-first AI agent infrastructure control plane built specifically for AI startups and engineering teams (2–50 employees) moving autonomous agents into production.

Instead of exposing raw unstructured log streams ("Here are your logs"), TylerDeck turns telemetry into actionable engineering intelligence:
> *"Agent success rate dropped 12.1% after version 1.5 release. 73% of failures are associated with database search tool timeouts."*

---

## 🔥 Key Features

- **Multi-Step Trajectory Tracing**: Full visual waterfall timeline capturing user inputs, agent thoughts, LLM calls, tool executions, and outputs.
- **Automated Version Regression Detection**: Automatically compares metric deltas across agent releases (e.g. `v1.4` vs `v1.5`), highlighting regressions in success rate, latency spikes, and cost increases.
- **Security & Action Policy Layer**: Configurable tool execution rules (`ALLOW`, `REQUIRE APPROVAL`, `BLOCK`) with risk level classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Cost & Model Pricing Intelligence**: Centralized 2026 pricing abstraction for OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude 3.5 Sonnet, Haiku), Google Gemini (Gemini 1.5 Pro, Flash), and custom providers.
- **Deterministic & Heuristic Evaluation Engine**: Automated scoring across 6 key metrics (Task Completion, Tool Correctness, Safety, Response Quality, Hallucination Risk).
- **Failure Intelligence & Error Clustering**: Grouping recurring errors into actionable buckets (Tool Timeout, Invalid Tool Arguments, LLM Rate Limit, Policy Violation).
- **Non-Blocking Python SDK (`tylerdeck`)**: Fail-open architecture with automatic PII/secret redaction and async background queue exporters.

---

## 🏗️ Repository Architecture

```
tylerdeck/
├── apps/
│   ├── api/                  # FastAPI Backend Engine (Python)
│   │   ├── routers/          # Auth, Projects, Traces, Metrics, Regressions, Errors, Security
│   │   ├── main.py           # FastAPI entrypoint & CORS setup
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic data validation schemas
│   │   ├── auth.py           # JWT & SHA-256 API key hashing
│   │   ├── pricing.py        # Centralized LLM pricing engine
│   │   ├── eval_engine.py    # 6-dimension evaluation scoring
│   │   ├── regression_engine.py # Version regression diff detector
│   │   └── policy_engine.py  # Security action policy engine
│   └── web/                  # Next.js 14 Command Center Dashboard (TypeScript / Tailwind)
│       ├── src/app/          # App Router (Dashboard, Traces, Regressions, Security, Cost)
│       └── src/components/   # Navbar, Footer, UI components
├── sdk/
│   └── python/               # tylerdeck Python package
│       └── tylerdeck/        # Client, @td.trace decorator, Async exporter, Redactor
├── database/
│   ├── seed.py               # Seed script with realistic production agent traces
│   └── tylerdeck.db          # Local SQLite database
├── docs/                     # Comprehensive product & technical documentation
├── docker/                   # Dockerfile.api & Dockerfile.web
├── docker-compose.yml        # Orchestration (API + Web + PostgreSQL)
└── README.md
```

---

## 🚀 Quickstart Guide (Local Setup)

### 1. Clone & Seed Database
```bash
cd tylerdeck

# Install API dependencies & seed database
pip install fastapi uvicorn pydantic sqlalchemy passlib python-jose python-multipart requests email-validator
python3 database/seed.py
```

### 2. Start Backend API Server
```bash
uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Start Next.js Control Center Dashboard
```bash
cd apps/web
npm install
npm run dev
```
Dashboard will be live at: `http://localhost:3000`

---

## 🐳 Docker Deployment

To launch the complete production stack (FastAPI Backend + Next.js Dashboard + PostgreSQL) with a single command:

```bash
docker compose up --build
```

---

## 🔑 Demo Credentials & Test SDK Key

- **User Login Email**: `alex@acmeai.com`
- **User Password**: `password123`
- **SDK Production API Key**: `td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c`

---

## 🧪 Testing

Run backend pytest unit and integration test suite:

```bash
pytest apps/api/tests/test_api.py
```

---

## 📜 Documentation Index

- [Architecture Specification](docs/ARCHITECTURE.md)
- [Product Overview](docs/PRODUCT.md)
- [Market Research (2026)](docs/MARKET_RESEARCH.md)
- [Security Specification](docs/SECURITY.md)
- [API Reference](docs/API.md)
- [Python SDK Guide](docs/SDK.md)
- [Future Roadmap](docs/ROADMAP.md)

---

## 📄 License

[MIT License](LICENSE) © 2026 TylerDeck Inc.
