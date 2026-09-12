from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# --- Auth & User Schemas ---
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    organization_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    organization_id: str
    email: str
    full_name: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_id: str

# --- Project & Agent Schemas ---
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime

class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    initial_version: Optional[str] = "v1.0"

class AgentResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    current_version: str
    created_at: datetime

class AgentVersionCreate(BaseModel):
    version: str
    changelog: Optional[str] = None

class AgentVersionResponse(BaseModel):
    id: str
    agent_id: str
    version: str
    changelog: Optional[str] = None
    created_at: datetime

# --- API Key Schemas ---
class APIKeyCreate(BaseModel):
    name: str

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    last_used_at: Optional[datetime] = None
    created_at: datetime

class APIKeyCreatedResponse(APIKeyResponse):
    raw_key: str  # Only returned once upon creation

# --- Ingestion & Trace Schemas ---
class LLMCallIngest(BaseModel):
    provider: str  # openai, anthropic, google, custom
    model: str     # gpt-4o, claude-3-5-sonnet, etc.
    prompt_tokens: int = 0
    completion_tokens: int = 0
    temperature: Optional[float] = 0.7
    finish_reason: Optional[str] = "stop"

class ToolCallIngest(BaseModel):
    tool_name: str
    tool_category: Optional[str] = "general"
    arguments: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    execution_time_ms: float = 0.0
    status: Optional[str] = "SUCCESS"  # SUCCESS, ERROR, TIMEOUT
    error_details: Optional[str] = None

class TraceEventIngest(BaseModel):
    event_type: str  # llm_call, tool_call, retrieval, thought, error, eval
    name: str
    parent_event_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_ms: float = 0.0
    inputs: Optional[Dict[str, Any]] = None
    outputs: Optional[Dict[str, Any]] = None
    status: str = "SUCCESS"
    metadata_json: Optional[Dict[str, Any]] = None
    llm_call: Optional[LLMCallIngest] = None
    tool_call: Optional[ToolCallIngest] = None

class TraceIngestRequest(BaseModel):
    agent_id: str
    agent_version: Optional[str] = "v1.0"
    trace_id: str  # SDK generated external trace ID
    name: str
    environment: Optional[str] = "production"
    user_id: Optional[str] = None
    input_text: Optional[str] = None
    output_text: Optional[str] = None
    total_duration_ms: float = 0.0
    status: Optional[str] = "SUCCESS"
    error_message: Optional[str] = None
    tags: Optional[Dict[str, Any]] = None
    events: List[TraceEventIngest] = []

class TraceResponse(BaseModel):
    id: str
    project_id: str
    agent_id: str
    agent_name: Optional[str] = None
    trace_id_external: str
    name: str
    environment: str
    agent_version: str
    status: str
    user_id_external: Optional[str] = None
    input_text: Optional[str] = None
    output_text: Optional[str] = None
    total_duration_ms: float
    total_input_tokens: int
    total_output_tokens: int
    total_cost_usd: float
    error_message: Optional[str] = None
    tags: Optional[Dict[str, Any]] = None
    created_at: datetime

class TraceEventDetail(BaseModel):
    id: str
    event_type: str
    name: str
    parent_event_id: Optional[str] = None
    duration_ms: float
    inputs: Optional[Dict[str, Any]] = None
    outputs: Optional[Dict[str, Any]] = None
    status: str
    metadata_json: Optional[Dict[str, Any]] = None
    llm_call: Optional[Dict[str, Any]] = None
    tool_call: Optional[Dict[str, Any]] = None

class EvaluationScore(BaseModel):
    overall_score: float
    task_completion_score: float
    response_quality_score: float
    tool_correctness_score: float
    safety_score: float
    hallucination_risk_score: float
    evaluator_type: str
    reasoning: Optional[str] = None

class TraceDetailResponse(TraceResponse):
    events: List[TraceEventDetail] = []
    evaluations: List[EvaluationScore] = []

# --- Policy & Security Schemas ---
class PolicyCreate(BaseModel):
    agent_id: str
    tool_name: str
    action_permission: str  # ALLOW, REQUIRE_APPROVAL, BLOCK
    risk_level: str        # LOW, MEDIUM, HIGH, CRITICAL

class PolicyResponse(BaseModel):
    id: str
    agent_id: str
    tool_name: str
    action_permission: str
    risk_level: str
    created_at: datetime

class PolicyViolationResponse(BaseModel):
    id: str
    trace_id: str
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    action_attempted: str
    severity: str
    status: str
    created_at: datetime

# --- Analytics & Overview Metrics Schemas ---
class OverviewMetricsResponse(BaseModel):
    total_runs: int
    successful_runs: int
    failed_runs: int
    success_rate_percent: float
    error_rate_percent: float
    avg_latency_ms: float
    p50_latency_ms: float
    p95_latency_ms: float
    total_tokens: int
    total_cost_usd: float
    tool_failures: int
    policy_violations: int

class SpendByProvider(BaseModel):
    provider: str
    amount_usd: float
    percentage: float

class CostBreakdownResponse(BaseModel):
    total_spend_usd: float
    providers: List[SpendByProvider]

class ErrorClusterItem(BaseModel):
    cluster_name: str
    error_type: str
    affected_runs: int
    last_seen: datetime
    representative_trace_id: str
    sample_error: str
    affected_agent: Optional[str] = None
    affected_version: Optional[str] = None

class RegressionDetail(BaseModel):
    metric_name: str
    previous_version: str
    current_version: str
    previous_value: str
    current_value: str
    delta_percent: float
    severity: str
    likely_factor: str

class AgentRegressionReport(BaseModel):
    agent_id: str
    agent_name: str
    current_version: str
    previous_version: str
    is_regression_detected: bool
    regressions: List[RegressionDetail] = []

class SecurityEventResponse(BaseModel):
    id: str
    organization_id: str
    project_id: str
    agent_id: str
    trace_id: Optional[str] = None
    event_id: Optional[str] = None
    event_type: str
    action_attempted: str
    severity: str
    details_json: Optional[Dict[str, Any]] = None
    created_at: datetime

class FailureClusterResponse(BaseModel):
    id: str
    project_id: str
    agent_id: str
    agent_version: str
    category: str
    count: int
    first_seen: datetime
    last_seen: datetime
    representative_trace_id: Optional[str] = None
    likely_association: Optional[Dict[str, Any]] = None

class EvalDatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DatasetCaseCreate(BaseModel):
    input_query: str
    expected_tool: Optional[str] = None
    expected_output_contains: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class DatasetRunCreate(BaseModel):
    agent_id: str
    agent_version: Optional[str] = "v1.0"

class WebhookCreate(BaseModel):
    name: str
    url: str
    secret: Optional[str] = None

class WebhookResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    url: str
    is_active: bool
    created_at: datetime

