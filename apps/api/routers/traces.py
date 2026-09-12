from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import (
    User, Project, Agent, Trace, TraceEvent, LLMCall, ToolCall, Evaluation
)
from apps.api.schemas import (
    TraceIngestRequest, TraceResponse, TraceDetailResponse, TraceEventDetail, EvaluationScore
)
from apps.api.auth import get_current_user, verify_sdk_api_key
from apps.api.pricing import calculate_llm_cost
from apps.api.eval_engine import evaluate_trace
from apps.api.policy_engine import check_policy_violations

router = APIRouter(prefix="/traces", tags=["Traces"])

# --- SDK Batch Ingestion Endpoint ---
@router.post("", response_model=dict)
def ingest_trace(
    payload: TraceIngestRequest,
    project: Project = Depends(verify_sdk_api_key),
    db: Session = Depends(get_db)
):
    """
    Ingests a complete agent execution trace sent by the TylerDeck Python SDK.
    Calculates token usage, model cost, policy violations, and evaluation scores.
    """
    # Verify or find agent
    agent = db.query(Agent).filter(
        Agent.id == payload.agent_id,
        Agent.project_id == project.id
    ).first()
    
    if not agent:
        # Fallback to query by agent name or create transient agent if ID not matching
        agent = db.query(Agent).filter(
            Agent.name == payload.agent_id,
            Agent.project_id == project.id
        ).first()

    if not agent:
        # Create agent automatically on first trace
        agent = Agent(
            project_id=project.id,
            name=payload.agent_id,
            current_version=payload.agent_version or "v1.0"
        )
        db.add(agent)
        db.flush()

    # Create Trace record
    trace = Trace(
        project_id=project.id,
        agent_id=agent.id,
        trace_id_external=payload.trace_id,
        name=payload.name,
        environment=payload.environment or "production",
        agent_version=payload.agent_version or agent.current_version,
        status=payload.status or "SUCCESS",
        user_id_external=payload.user_id,
        input_text=payload.input_text,
        output_text=payload.output_text,
        total_duration_ms=payload.total_duration_ms,
        error_message=payload.error_message,
        tags=payload.tags or {},
        created_at=datetime.now(timezone.utc)
    )
    db.add(trace)
    db.flush()

    total_input_tokens = 0
    total_output_tokens = 0
    total_cost_usd = 0.0
    created_events: List[TraceEvent] = []
    tool_calls_raw: List[dict] = []

    # Process events
    for ev_in in payload.events:
        event = TraceEvent(
            trace_id=trace.id,
            event_type=ev_in.event_type,
            name=ev_in.name,
            parent_event_id=ev_in.parent_event_id,
            start_time=ev_in.start_time or datetime.now(timezone.utc),
            end_time=ev_in.end_time or datetime.now(timezone.utc),
            duration_ms=ev_in.duration_ms,
            inputs=ev_in.inputs,
            outputs=ev_in.outputs,
            status=ev_in.status,
            metadata_json=ev_in.metadata_json
        )
        db.add(event)
        db.flush()
        created_events.append(event)

        # LLM Call sub-record
        if ev_in.llm_call:
            cost = calculate_llm_cost(
                ev_in.llm_call.model,
                ev_in.llm_call.prompt_tokens,
                ev_in.llm_call.completion_tokens
            )
            llm_rec = LLMCall(
                trace_event_id=event.id,
                provider=ev_in.llm_call.provider,
                model=ev_in.llm_call.model,
                prompt_tokens=ev_in.llm_call.prompt_tokens,
                completion_tokens=ev_in.llm_call.completion_tokens,
                cost_usd=cost,
                temperature=ev_in.llm_call.temperature or 0.7,
                finish_reason=ev_in.llm_call.finish_reason or "stop"
            )
            db.add(llm_rec)
            total_input_tokens += ev_in.llm_call.prompt_tokens
            total_output_tokens += ev_in.llm_call.completion_tokens
            total_cost_usd += cost

        # Tool Call sub-record
        if ev_in.tool_call:
            tool_rec = ToolCall(
                trace_event_id=event.id,
                tool_name=ev_in.tool_call.tool_name,
                tool_category=ev_in.tool_call.tool_category or "general",
                arguments=ev_in.tool_call.arguments,
                result=ev_in.tool_call.result,
                execution_time_ms=ev_in.tool_call.execution_time_ms,
                status=ev_in.tool_call.status or "SUCCESS",
                error_details=ev_in.tool_call.error_details
            )
            db.add(tool_rec)
            tool_calls_raw.append({
                "tool_name": ev_in.tool_call.tool_name,
                "tool_category": ev_in.tool_call.tool_category,
                "status": ev_in.tool_call.status
            })

    # Update trace token & cost totals
    trace.total_input_tokens = total_input_tokens
    trace.total_output_tokens = total_output_tokens
    trace.total_cost_usd = round(total_cost_usd, 6)

    # Policy Violation Check
    violations = check_policy_violations(db, agent.id, trace, tool_calls_raw)
    if violations:
        for v in violations:
            db.add(v)
        if any(v.status == "BLOCKED" for v in violations):
            trace.status = "POLICY_VIOLATION"

    # Auto Evaluation
    eval_rec = evaluate_trace(trace, created_events)
    db.add(eval_rec)

    db.commit()
    return {"status": "success", "trace_id": trace.id, "external_id": trace.trace_id_external}

# --- Dashboard Trace Listing with Server-Side Search & Pagination ---
@router.get("", response_model=List[TraceResponse])
def list_traces(
    project_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    agent: Optional[str] = None,
    status_filter: Optional[str] = None,
    status: Optional[str] = None,
    version_filter: Optional[str] = None,
    version: Optional[str] = None,
    environment: Optional[str] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    tool: Optional[str] = None,
    error: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns server-side filtered and paginated trace records.
    Filters: agent, version, status, provider, model, tool, error, environment, date range.
    """
    query = db.query(Trace).join(Project).filter(Project.organization_id == current_user.organization_id)
    
    resolved_agent = agent_id or agent
    resolved_status = status_filter or status
    resolved_version = version_filter or version

    if project_id:
        query = query.filter(Trace.project_id == project_id)
    if resolved_agent:
        query = query.filter((Trace.agent_id == resolved_agent) | (Trace.agent_id.in_(
            db.query(Agent.id).filter(Agent.name.ilike(f"%{resolved_agent}%"))
        )))
    if resolved_status:
        query = query.filter(Trace.status == resolved_status)
    if resolved_version:
        query = query.filter(Trace.agent_version == resolved_version)
    if environment:
        query = query.filter(Trace.environment == environment)
    if error:
        query = query.filter(Trace.error_message.ilike(f"%{error}%"))
    if date_from:
        query = query.filter(Trace.created_at >= date_from)
    if date_to:
        query = query.filter(Trace.created_at <= date_to)

    # Sub-query filters for provider, model, tool
    if provider or model:
        llm_filter = db.query(TraceEvent.trace_id).join(LLMCall)
        if provider:
            llm_filter = llm_filter.filter(LLMCall.provider == provider.lower())
        if model:
            llm_filter = llm_filter.filter(LLMCall.model.ilike(f"%{model}%"))
        query = query.filter(Trace.id.in_(llm_filter))

    if tool:
        tool_filter = db.query(TraceEvent.trace_id).join(ToolCall).filter(ToolCall.tool_name.ilike(f"%{tool}%"))
        query = query.filter(Trace.id.in_(tool_filter))

    traces = query.order_by(Trace.created_at.desc()).offset(offset).limit(limit).all()

    result = []
    for t in traces:
        agent_obj = db.query(Agent).filter(Agent.id == t.agent_id).first()
        result.append(TraceResponse(
            id=t.id,
            project_id=t.project_id,
            agent_id=t.agent_id,
            agent_name=agent_obj.name if agent_obj else "Unknown Agent",
            trace_id_external=t.trace_id_external,
            name=t.name,
            environment=t.environment,
            agent_version=t.agent_version,
            status=t.status,
            user_id_external=t.user_id_external,
            input_text=t.input_text,
            output_text=t.output_text,
            total_duration_ms=t.total_duration_ms,
            total_input_tokens=t.total_input_tokens,
            total_output_tokens=t.total_output_tokens,
            total_cost_usd=t.total_cost_usd,
            error_message=t.error_message,
            tags=t.tags,
            created_at=t.created_at
        ))
    return result

# --- Dashboard Trace Detail ---
@router.get("/{trace_id}", response_model=TraceDetailResponse)
def get_trace_detail(
    trace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trace = db.query(Trace).join(Project).filter(
        Trace.id == trace_id,
        Project.organization_id == current_user.organization_id
    ).first()

    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    agent = db.query(Agent).filter(Agent.id == trace.agent_id).first()

    # Get events
    events = db.query(TraceEvent).filter(TraceEvent.trace_id == trace.id).order_by(TraceEvent.start_time.asc()).all()
    events_detail = []
    for ev in events:
        llm_data = None
        if ev.llm_call:
            llm_data = {
                "provider": ev.llm_call.provider,
                "model": ev.llm_call.model,
                "prompt_tokens": ev.llm_call.prompt_tokens,
                "completion_tokens": ev.llm_call.completion_tokens,
                "cost_usd": ev.llm_call.cost_usd,
                "temperature": ev.llm_call.temperature
            }
        tool_data = None
        if ev.tool_call:
            tool_data = {
                "tool_name": ev.tool_call.tool_name,
                "tool_category": ev.tool_call.tool_category,
                "arguments": ev.tool_call.arguments,
                "result": ev.tool_call.result,
                "execution_time_ms": ev.tool_call.execution_time_ms,
                "status": ev.tool_call.status,
                "error_details": ev.tool_call.error_details
            }
        
        events_detail.append(TraceEventDetail(
            id=ev.id,
            event_type=ev.event_type,
            name=ev.name,
            parent_event_id=ev.parent_event_id,
            duration_ms=ev.duration_ms,
            inputs=ev.inputs,
            outputs=ev.outputs,
            status=ev.status,
            metadata_json=ev.metadata_json,
            llm_call=llm_data,
            tool_call=tool_data
        ))

    # Get evaluations
    evals = db.query(Evaluation).filter(Evaluation.trace_id == trace.id).all()
    evals_detail = [
        EvaluationScore(
            overall_score=e.overall_score,
            task_completion_score=e.task_completion_score,
            response_quality_score=e.response_quality_score,
            tool_correctness_score=e.tool_correctness_score,
            safety_score=e.safety_score,
            hallucination_risk_score=e.hallucination_risk_score,
            evaluator_type=e.evaluator_type,
            reasoning=e.reasoning
        ) for e in evals
    ]

    return TraceDetailResponse(
        id=trace.id,
        project_id=trace.project_id,
        agent_id=trace.agent_id,
        agent_name=agent.name if agent else "Unknown Agent",
        trace_id_external=trace.trace_id_external,
        name=trace.name,
        environment=trace.environment,
        agent_version=trace.agent_version,
        status=trace.status,
        user_id_external=trace.user_id_external,
        input_text=trace.input_text,
        output_text=trace.output_text,
        total_duration_ms=trace.total_duration_ms,
        total_input_tokens=trace.total_input_tokens,
        total_output_tokens=trace.total_output_tokens,
        total_cost_usd=trace.total_cost_usd,
        error_message=trace.error_message,
        tags=trace.tags,
        created_at=trace.created_at,
        events=events_detail,
        evaluations=evals_detail
    )
