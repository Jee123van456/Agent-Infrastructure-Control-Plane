# TylerDeck Ecosystem Architecture Overview

## Product Vision & Core Loop
TylerDeck is an end-to-end AI Agent Reliability & Observability Platform (*Observe. Evaluate. Improve. Ship AI Agents.*) designed for high-growth AI engineering teams (approx. 2–50 employees).

```
CUSTOMER AI AGENT
        ↓
TYLERDECK SDK / API
        ↓
TRACE INGESTION & SESSIONS
        ↓
OBSERVATIONS (LLM / Tool / Retrieval / Workflow)
        ↓
PRODUCTION MONITORING & DASHBOARDS
        ↓
EVALUATION ENGINE (Deterministic & LLM Judge)
        ↓
PRODUCTION FEEDBACK & HUMAN ANNOTATIONS
        ↓
DATASET SYSTEM & CASE CONVERSION
        ↓
EXPERIMENT ENGINE (Side-by-side Candidate Benchmarks)
        ↓
PROMPT & MODEL VERSION COMPARISON
        ↓
REGRESSION DETECTION & AGENT HEALTH
        ↓
FAILURE INTELLIGENCE & CLUSTERING
        ↓
DEPLOY & PRODUCTION MONITORING
        ↓
LOOP BACK
```

## Primary Information Architecture (14 Modules)
1. **Overview**: Key platform metrics, total traces, success rate, p95 latency, AI spend, health score, and onboarding checklist.
2. **Agents**: Fleet health, transparent health score calculation breakdown, active versions.
3. **Traces**: Server-side filtered and paginated execution trace explorer with timeline tree view.
4. **Sessions**: Multi-turn user conversation grouping and session-level metrics.
5. **Prompts**: Version-controlled prompt management, environment labeling (production/staging), variable declaration.
6. **Playground**: Live prompt template testing, model selection (OpenAI, Anthropic, Gemini), variable injection, token cost calculation.
7. **Evaluations**: Real-time evaluation scoring (correctness, safety, hallucination risk, response quality).
8. **Datasets**: Golden benchmark datasets and 1-click trace-to-dataset case conversion.
9. **Experiments**: Side-by-side candidate comparison (Prompt v1 vs v2, GPT-4o vs Claude 3.5 Sonnet).
10. **Failures**: Dynamic error clustering (TOOL_TIMEOUT, POLICY_VIOLATION, etc.) with actionable recommendations.
11. **Regressions**: Automated release regression detection comparing baseline vs candidate versions.
12. **Cost**: Provider and model spend breakdown with INR/USD normalization.
13. **Alerts**: Automated alerts on success drop, latency spikes, or security violations.
14. **Security & Policies**: Tool-level access control policies (ALLOW, REQUIRE_APPROVAL, BLOCK) and security audit logs.
15. **Settings**: Project configuration, team members, and API key management.
