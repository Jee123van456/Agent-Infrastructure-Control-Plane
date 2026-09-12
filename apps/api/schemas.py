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

class OAuthLoginRequest(BaseModel):
    provider: str  # 'google', 'apple'
    email: EmailStr
    full_name: Optional[str] = None
    provider_user_id: Optional[str] = None
    id_token: Optional[str] = None
    avatar_url: Optional[str] = None
    organization_name: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    organization_id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    auth_provider: Optional[str] = "email"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_id: str
    avatar_url: Optional[str] = None
    auth_provider: Optional[str] = "email"

# --- Organization & Environment Schemas ---
class OrganizationCreate(BaseModel):
    name: str

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime

class EnvironmentCreate(BaseModel):
    name: str  # development, staging, production
    description: Optional[str] = None

class EnvironmentResponse(BaseModel):
    id: str
    project_id: str
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime

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
    environment: Optional[str] = "development"
    framework: Optional[str] = "custom"
    provider: Optional[str] = "openai"
    model: Optional[str] = "gpt-4o"
    initial_version: Optional[str] = "v1.0.0"

class AgentResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    environment: str = "development"
    framework: str = "custom"
    provider: str = "openai"
    model: str = "gpt-4o"
    current_version: str = "v1.0.0"
    created_at: datetime

class AgentVersionCreate(BaseModel):
    version: str
    provider: Optional[str] = "openai"
    model: Optional[str] = "gpt-4o"
    configuration_json: Optional[Dict[str, Any]] = None
    status: Optional[str] = "active"
    changelog: Optional[str] = None

class AgentVersionResponse(BaseModel):
    id: str
    agent_id: str
    version: str
    provider: Optional[str] = "openai"
    model: Optional[str] = "gpt-4o"
    configuration_json: Optional[Dict[str, Any]] = None
    status: str = "active"
    changelog: Optional[str] = None
    created_at: datetime

class ProjectDetailResponse(ProjectResponse):
    environments: List[EnvironmentResponse] = []
    agents: List[AgentResponse] = []
    trace_count: int = 0

# --- API Key Schemas ---
class APIKeyCreate(BaseModel):
    name: str
    environment: Optional[str] = "development"

class APIKeyResponse(BaseModel):
    id: str
    name: str
    environment: str = "development"
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

class ObservationIngest(BaseModel):
    id: Optional[str] = None
    parent_id: Optional[str] = None
    type: str  # generation, tool, retrieval, event, workflow, custom
    name: str
    status: Optional[str] = "SUCCESS"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    latency_ms: float = 0.0
    input_json: Optional[Dict[str, Any]] = None
    output_json: Optional[Dict[str, Any]] = None
    metadata_json: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    prompt_version_id: Optional[str] = None
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0

class TraceIngestRequest(BaseModel):
    agent_id: str
    agent_version: Optional[str] = "v1.0"
    session_id: Optional[str] = None
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
    observations: List[ObservationIngest] = []

class TraceResponse(BaseModel):
    id: str
    project_id: str
    agent_id: str
    agent_name: Optional[str] = None
    session_id: Optional[str] = None
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

# --- Session Schemas ---
class SessionCreate(BaseModel):
    agent_id: Optional[str] = None
    environment: Optional[str] = "production"
    external_session_id: Optional[str] = None
    user_id_external: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class SessionResponse(BaseModel):
    id: str
    project_id: str
    agent_id: Optional[str] = None
    environment: str
    external_session_id: Optional[str] = None
    user_id_external: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    trace_count: int = 0
    total_cost_usd: float = 0.0
    total_latency_ms: float = 0.0

# --- Prompt Schemas ---
class PromptCreate(BaseModel):
    name: str
    description: Optional[str] = None
    initial_content: str
    variables: Optional[List[str]] = []

class PromptVersionCreate(BaseModel):
    version: str
    content: str
    variables: Optional[List[str]] = []
    environment_label: Optional[str] = "production"
    status: Optional[str] = "ACTIVE"

class PromptVersionResponse(BaseModel):
    id: str
    prompt_id: str
    version: str
    content: str
    variables_json: Optional[Dict[str, Any]] = None
    created_by: Optional[str] = None
    environment_label: str
    status: str
    created_at: datetime

class PromptResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    current_version: Optional[PromptVersionResponse] = None

# --- Playground Schemas ---
class PlaygroundRunRequest(BaseModel):
    prompt_content: str
    input_variables: Dict[str, Any] = {}
    model: str = "gpt-4o"
    provider: str = "openai"
    temperature: float = 0.7

class PlaygroundRunResponse(BaseModel):
    response_text: str
    latency_ms: float
    input_tokens: int
    output_tokens: int
    cost_usd: float
    provider: str
    model: str

# --- Experiment Schemas ---
class ExperimentCandidateSchema(BaseModel):
    candidate_label: str
    prompt_version_id: Optional[str] = None
    model: Optional[str] = "gpt-4o"
    provider: Optional[str] = "openai"

class ExperimentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dataset_id: str
    candidates: List[ExperimentCandidateSchema]

class ExperimentRunSchema(BaseModel):
    id: str
    candidate_id: str
    candidate_label: str
    dataset_case_id: str
    input_query: str
    output_text: str
    latency_ms: float
    cost_usd: float
    evaluation_score: float
    status: str

class ExperimentResponse(BaseModel):
    id: str
    project_id: str
    dataset_id: str
    dataset_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    candidates: List[Dict[str, Any]] = []
    runs: List[ExperimentRunSchema] = []

# --- Feedback & Annotation Schemas ---
class UserFeedbackCreate(BaseModel):
    trace_id: Optional[str] = None
    session_id: Optional[str] = None
    feedback_type: str  # thumbs_up, thumbs_down, rating, comment
    rating_value: Optional[float] = None
    comment: Optional[str] = None
    user_id_external: Optional[str] = None

class UserFeedbackResponse(BaseModel):
    id: str
    trace_id: Optional[str] = None
    session_id: Optional[str] = None
    feedback_type: str
    rating_value: Optional[float] = None
    comment: Optional[str] = None
    created_at: datetime

class HumanAnnotationCreate(BaseModel):
    trace_id: str
    quality_score: float = Field(..., ge=0.0, le=100.0)
    correctness_score: float = Field(..., ge=0.0, le=100.0)
    relevance_score: float = Field(..., ge=0.0, le=100.0)
    safety_score: float = Field(..., ge=0.0, le=100.0)
    notes: Optional[str] = None

class HumanAnnotationResponse(BaseModel):
    id: str
    trace_id: str
    reviewer_id: str
    quality_score: float
    correctness_score: float
    relevance_score: float
    safety_score: float
    notes: Optional[str] = None
    created_at: datetime


