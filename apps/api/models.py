import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON, Numeric
)
from sqlalchemy.orm import relationship
from apps.api.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="member")  # owner, admin, member
    auth_provider = Column(String(50), default="email")  # email, google, apple
    provider_user_id = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class EnvironmentModel(Base):
    __tablename__ = "environments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(50), nullable=False)  # development, staging, production
    slug = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="environments")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="projects")
    environments = relationship("EnvironmentModel", back_populates="project", cascade="all, delete-orphan")
    agents = relationship("Agent", back_populates="project", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="project", cascade="all, delete-orphan")
    traces = relationship("Trace", back_populates="project", cascade="all, delete-orphan")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    environment = Column(String(50), default="development")
    framework = Column(String(100), default="custom")  # langchain, llamaindex, autogen, custom
    provider = Column(String(50), default="openai")     # openai, anthropic, google, custom
    model = Column(String(100), default="gpt-4o")
    current_version = Column(String(50), default="v1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="agents")
    versions = relationship("AgentVersion", back_populates="agent", cascade="all, delete-orphan")
    traces = relationship("Trace", back_populates="agent", cascade="all, delete-orphan")
    policies = relationship("Policy", back_populates="agent", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="agent", cascade="all, delete-orphan")

class AgentVersion(Base):
    __tablename__ = "agent_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    version = Column(String(50), nullable=False)
    provider = Column(String(50), default="openai")
    model = Column(String(100), default="gpt-4o")
    configuration_json = Column(JSON, nullable=True)
    status = Column(String(50), default="active")  # draft, active, deprecated
    changelog = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="versions")

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    environment = Column(String(50), default="development")
    name = Column(String(255), nullable=False)
    key_prefix = Column(String(16), nullable=False)  # e.g., 'td_live_a1b2'
    key_hash = Column(String(255), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="api_keys")

class Trace(Base):
    __tablename__ = "traces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    trace_id_external = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    environment = Column(String(50), default="production")  # production, staging, dev
    agent_version = Column(String(50), default="v1.0")
    status = Column(String(50), default="SUCCESS")  # SUCCESS, ERROR, POLICY_VIOLATION, IN_PROGRESS
    user_id_external = Column(String(255), nullable=True)
    input_text = Column(Text, nullable=True)
    output_text = Column(Text, nullable=True)
    total_duration_ms = Column(Float, default=0.0)
    total_input_tokens = Column(Integer, default=0)
    total_output_tokens = Column(Integer, default=0)
    total_cost_usd = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=True, index=True)

    project = relationship("Project", back_populates="traces")
    agent = relationship("Agent", back_populates="traces")
    session = relationship("Session", back_populates="traces")
    events = relationship("TraceEvent", back_populates="trace", cascade="all, delete-orphan")
    observations = relationship("Observation", back_populates="trace", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="trace", cascade="all, delete-orphan")
    policy_violations = relationship("PolicyViolation", back_populates="trace", cascade="all, delete-orphan")
    feedback = relationship("UserFeedback", back_populates="trace", cascade="all, delete-orphan")
    annotations = relationship("HumanAnnotation", back_populates="trace", cascade="all, delete-orphan")

class TraceEvent(Base):
    __tablename__ = "trace_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # llm_call, tool_call, retrieval, thought, error, eval
    name = Column(String(255), nullable=False)
    parent_event_id = Column(String(36), nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, default=datetime.utcnow)
    duration_ms = Column(Float, default=0.0)
    inputs = Column(JSON, nullable=True)
    outputs = Column(JSON, nullable=True)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, ERROR
    metadata_json = Column(JSON, nullable=True)

    trace = relationship("Trace", back_populates="events")
    llm_call = relationship("LLMCall", back_populates="trace_event", uselist=False, cascade="all, delete-orphan")
    tool_call = relationship("ToolCall", back_populates="trace_event", uselist=False, cascade="all, delete-orphan")

class LLMCall(Base):
    __tablename__ = "llm_calls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_event_id = Column(String(36), ForeignKey("trace_events.id"), nullable=False)
    provider = Column(String(50), nullable=False)  # openai, anthropic, google, custom
    model = Column(String(100), nullable=False)    # gpt-4o, claude-3-5-sonnet, etc.
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    temperature = Column(Float, default=0.7)
    finish_reason = Column(String(50), default="stop")

    trace_event = relationship("TraceEvent", back_populates="llm_call")

class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_event_id = Column(String(36), ForeignKey("trace_events.id"), nullable=False)
    tool_name = Column(String(255), nullable=False)
    tool_category = Column(String(100), default="general")  # database, api, search, payment, shell
    arguments = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    execution_time_ms = Column(Float, default=0.0)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, ERROR, TIMEOUT
    error_details = Column(Text, nullable=True)

    trace_event = relationship("TraceEvent", back_populates="tool_call")

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=False)
    overall_score = Column(Float, default=0.0)       # 0 - 100
    task_completion_score = Column(Float, default=0.0)
    response_quality_score = Column(Float, default=0.0)
    tool_correctness_score = Column(Float, default=0.0)
    safety_score = Column(Float, default=0.0)
    hallucination_risk_score = Column(Float, default=0.0)
    evaluator_type = Column(String(50), default="deterministic")  # deterministic, llm_judge
    reasoning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trace = relationship("Trace", back_populates="evaluations")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    tool_name = Column(String(255), nullable=False)
    action_permission = Column(String(50), default="ALLOW")  # ALLOW, REQUIRE_APPROVAL, BLOCK
    risk_level = Column(String(50), default="LOW")            # LOW, MEDIUM, HIGH, CRITICAL
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="policies")
    violations = relationship("PolicyViolation", back_populates="policy")

class PolicyViolation(Base):
    __tablename__ = "policy_violations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=False)
    policy_id = Column(String(36), ForeignKey("policies.id"), nullable=True)
    action_attempted = Column(String(255), nullable=False)
    severity = Column(String(50), default="HIGH")
    status = Column(String(50), default="BLOCKED")  # BLOCKED, AUDITED
    created_at = Column(DateTime, default=datetime.utcnow)

    trace = relationship("Trace", back_populates="policy_violations")
    policy = relationship("Policy", back_populates="violations")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    name = Column(String(255), nullable=False)
    metric_type = Column(String(50), nullable=False)  # success_rate, error_rate, latency, cost, policy_violation
    threshold_value = Column(Float, nullable=False)
    condition = Column(String(20), default="less_than")  # less_than, greater_than
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="alerts")
    events = relationship("AlertEvent", back_populates="alert", cascade="all, delete-orphan")

class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_id = Column(String(36), ForeignKey("alerts.id"), nullable=False)
    message = Column(Text, nullable=False)
    current_value = Column(Float, nullable=False)
    severity = Column(String(50), default="WARNING")  # INFO, WARNING, CRITICAL
    created_at = Column(DateTime, default=datetime.utcnow)

    alert = relationship("Alert", back_populates="events")

class ModelPricing(Base):
    __tablename__ = "model_pricing"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False, unique=True)
    input_cost_per_1m = Column(Float, nullable=False)   # in USD
    output_cost_per_1m = Column(Float, nullable=False)  # in USD
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class EvalDataset(Base):
    __tablename__ = "eval_datasets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    cases = relationship("DatasetCase", back_populates="dataset", cascade="all, delete-orphan")
    runs = relationship("DatasetRun", back_populates="dataset", cascade="all, delete-orphan")

class DatasetCase(Base):
    __tablename__ = "dataset_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("eval_datasets.id"), nullable=False)
    input_query = Column(Text, nullable=False)
    expected_tool = Column(String(255), nullable=True)
    expected_output_contains = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("EvalDataset", back_populates="cases")

class DatasetRun(Base):
    __tablename__ = "dataset_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("eval_datasets.id"), nullable=False)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    agent_version = Column(String(50), default="v1.0")
    total_cases = Column(Integer, default=0)
    passed_cases = Column(Integer, default=0)
    pass_rate_percent = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("EvalDataset", back_populates="runs")

class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    secret = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    logs = relationship("WebhookLog", back_populates="webhook", cascade="all, delete-orphan")

class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    webhook_id = Column(String(36), ForeignKey("webhooks.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    status_code = Column(Integer, nullable=True)
    payload_json = Column(JSON, nullable=True)
    response_body = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    webhook = relationship("Webhook", back_populates="logs")

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=True)
    event_id = Column(String(36), nullable=True)
    event_type = Column(String(50), nullable=False)  # POLICY_VIOLATION, BLOCKED_ACTION, APPROVAL_REQUIRED, SUSPICIOUS_TOOL_CALL
    action_attempted = Column(String(255), nullable=False)
    severity = Column(String(50), default="HIGH")     # LOW, MEDIUM, HIGH, CRITICAL
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class FailureCluster(Base):
    __tablename__ = "failure_clusters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    agent_version = Column(String(50), default="v1.0")
    category = Column(String(100), nullable=False)  # TOOL_TIMEOUT, INVALID_TOOL_ARGUMENT, LLM_TIMEOUT, LLM_RATE_LIMIT, PROVIDER_ERROR, POLICY_VIOLATION, EVALUATION_FAILURE, UNKNOWN
    count = Column(Integer, default=1)
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    representative_trace_id = Column(String(36), nullable=True)
    likely_association = Column(JSON, nullable=True)

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True, index=True)
    environment = Column(String(50), default="production", index=True)
    external_session_id = Column(String(255), nullable=True, index=True)
    user_id_external = Column(String(255), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    traces = relationship("Trace", back_populates="session")
    observations = relationship("Observation", back_populates="session")
    feedback = relationship("UserFeedback", back_populates="session")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=False, index=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=True, index=True)
    parent_id = Column(String(36), nullable=True)
    type = Column(String(50), nullable=False)  # generation, tool, retrieval, event, workflow, custom
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, ERROR, TIMEOUT
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    latency_ms = Column(Float, default=0.0)
    input_json = Column(JSON, nullable=True)
    output_json = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    provider = Column(String(50), nullable=True)
    model = Column(String(100), nullable=True)
    prompt_version_id = Column(String(36), ForeignKey("prompt_versions.id"), nullable=True)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)

    trace = relationship("Trace", back_populates="observations")
    session = relationship("Session", back_populates="observations")

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    versions = relationship("PromptVersion", back_populates="prompt", cascade="all, delete-orphan")

class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prompt_id = Column(String(36), ForeignKey("prompts.id"), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    variables_json = Column(JSON, nullable=True)
    created_by = Column(String(255), nullable=True)
    environment_label = Column(String(50), default="production")  # production, staging, development
    status = Column(String(50), default="ACTIVE")
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    prompt = relationship("Prompt", back_populates="versions")

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    dataset_id = Column(String(36), ForeignKey("eval_datasets.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="COMPLETED")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidates = relationship("ExperimentCandidate", back_populates="experiment", cascade="all, delete-orphan")
    runs = relationship("ExperimentRun", back_populates="experiment", cascade="all, delete-orphan")

class ExperimentCandidate(Base):
    __tablename__ = "experiment_candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False, index=True)
    candidate_label = Column(String(100), nullable=False)  # Candidate A, Candidate B
    prompt_version_id = Column(String(36), ForeignKey("prompt_versions.id"), nullable=True)
    model = Column(String(100), nullable=True)
    provider = Column(String(50), nullable=True)
    parameters_json = Column(JSON, nullable=True)

    experiment = relationship("Experiment", back_populates="candidates")

class ExperimentRun(Base):
    __tablename__ = "experiment_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False, index=True)
    candidate_id = Column(String(36), ForeignKey("experiment_candidates.id"), nullable=False)
    dataset_case_id = Column(String(36), ForeignKey("dataset_cases.id"), nullable=False)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=True)
    output_text = Column(Text, nullable=True)
    latency_ms = Column(Float, default=0.0)
    cost_usd = Column(Float, default=0.0)
    evaluation_score = Column(Float, default=0.0)
    status = Column(String(50), default="SUCCESS")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    experiment = relationship("Experiment", back_populates="runs")

class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=True, index=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=True, index=True)
    feedback_type = Column(String(50), nullable=False)  # thumbs_up, thumbs_down, rating, comment
    rating_value = Column(Float, nullable=True)
    comment = Column(Text, nullable=True)
    user_id_external = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trace = relationship("Trace", back_populates="feedback")
    session = relationship("Session", back_populates="feedback")

class HumanAnnotation(Base):
    __tablename__ = "human_annotations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trace_id = Column(String(36), ForeignKey("traces.id"), nullable=False, index=True)
    reviewer_id = Column(String(255), nullable=False)
    quality_score = Column(Float, default=0.0)
    correctness_score = Column(Float, default=0.0)
    relevance_score = Column(Float, default=0.0)
    safety_score = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trace = relationship("Trace", back_populates="annotations")



