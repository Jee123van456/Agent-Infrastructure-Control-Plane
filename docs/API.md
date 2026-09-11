# TYLERDECK API REFERENCE

## Base URL
`http://localhost:8000/api/v1`

## Authentication
- **SDK Endpoints**: `Authorization: Bearer td_live_...`
- **Dashboard Endpoints**: `Authorization: Bearer <jwt_access_token>`

## Core Endpoints
- `POST /api/v1/auth/signup` — Register new user and organization
- `POST /api/v1/auth/login` — Sign in and obtain JWT
- `POST /api/v1/traces` — Batch ingest trace trajectory (SDK)
- `GET  /api/v1/traces` — Query paginated trace list
- `GET  /api/v1/traces/{id}` — Fetch detailed trace execution tree
- `GET  /api/v1/metrics/overview` — Fetch dashboard stats and latency P50/P95
- `GET  /api/v1/metrics/cost-breakdown` — Fetch spend per provider/model
- `GET  /api/v1/regressions` — Automated version regression report
- `GET  /api/v1/errors/clusters` — Grouped error intelligence clusters
- `GET  /api/v1/policies` & `POST /api/v1/policies` — Security policy management
