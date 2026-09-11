# TYLERDECK ARCHITECTURE SPECIFICATION

## Overview
TylerDeck is structured as a modern multi-tenant AI agent control plane. It captures high-throughput telemetry, evaluates tool-use trajectories, detects version regressions, and enforces tool security policies.

```
+-------------------------------------------------------------------+
|                        CUSTOMER APPLICATION                       |
|        (Python App using OpenAI / Anthropic / Custom Agent)       |
+-------------------------------------------------------------------+
                                  |
                   tylerdeck Python SDK (Fail-Open)
                                  |  HTTP POST /api/v1/traces
                                  v
+-------------------------------------------------------------------+
|                       TYLERDECK FASTAPI BACKEND                   |
|  +-------------------+  +--------------------+  +--------------+  |
|  | Auth & API Keys   |  | Trace Ingestion    |  | Pricing Engine|  |
|  +-------------------+  +--------------------+  +--------------+  |
|  | Eval Engine       |  | Regression Detector|  | Policy Engine|  |
|  +-------------------+  +--------------------+  +--------------+  |
+-------------------------------------------------------------------+
                                  |
                   SQLAlchemy ORM + asyncpg Driver
                                  v
+-------------------------------------------------------------------+
|                       POSTGRESQL DATABASE                         |
+-------------------------------------------------------------------+
                                  ^
                   REST API Calls / Next.js Server Components
                                  |
+-------------------------------------------------------------------+
|                      TYLERDECK DASHBOARD (UI)                     |
+-------------------------------------------------------------------+
```

## System Components
1. **Python SDK (`tylerdeck`)**: Fail-open, non-blocking background thread exporter. Automatically redacts PII and secrets before sending JSON payloads over HTTP.
2. **FastAPI Backend (`apps/api`)**: High-performance REST API handling auth, project multi-tenancy, trace ingestion, pricing calculations, regression diffs, error clustering, and policy enforcement.
3. **Database Layer (`database`)**: SQLAlchemy 2.0 ORM with PostgreSQL / SQLite compatibility. Schema normalized across 15+ entities with UUID primary keys and indexing on trace timestamps and external trace IDs.
4. **Next.js 14 Web Dashboard (`apps/web`)**: Futuristic dark-first command center interface providing interactive waterfall trajectory visualization, version regression diffs, failure intelligence, and security policy management.
