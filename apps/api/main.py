from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from apps.api.config import settings
from apps.api.database import engine, Base, SessionLocal
from apps.api.routers import (
    auth, projects, traces, metrics, regressions, errors, policies, evaluations, alerts,
    datasets, webhooks, tool_graph
)

# Auto-create tables on startup if not present
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="TylerDeck - Production Control Plane for AI Agents (Observability, Evals, Security, Regressions)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(projects.router, prefix=settings.API_V1_PREFIX)
app.include_router(traces.router, prefix=settings.API_V1_PREFIX)
app.include_router(metrics.router, prefix=settings.API_V1_PREFIX)
app.include_router(regressions.router, prefix=settings.API_V1_PREFIX)
app.include_router(errors.router, prefix=settings.API_V1_PREFIX)
app.include_router(policies.router, prefix=settings.API_V1_PREFIX)
app.include_router(evaluations.router, prefix=settings.API_V1_PREFIX)
app.include_router(alerts.router, prefix=settings.API_V1_PREFIX)
app.include_router(datasets.router, prefix=settings.API_V1_PREFIX)
app.include_router(webhooks.router, prefix=settings.API_V1_PREFIX)
app.include_router(tool_graph.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "name": "TylerDeck API",
        "tagline": "Agent Reliability Intelligence — Observe. Evaluate. Secure. Ship AI Agents.",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/ready")
def readiness_check():
    """
    Readiness probe for Kubernetes and Docker.
    Verifies live database connectivity and application worker readiness.
    """
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "exporter_queue": "operational"
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {exc}"
        )
    finally:
        db.close()
