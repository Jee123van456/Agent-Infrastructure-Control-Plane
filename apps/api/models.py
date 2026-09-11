import uuid
from datetime import datetime
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
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="projects")
    agents = relationship("Agent", back_populates="project", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="project", cascade="all, delete-orphan")
    traces = relationship("Trace", back_populates="project", cascade="all, delete-orphan")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    current_version = Column(String(50), default="v1.0")
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
    changelog = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="versions")

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    key_prefix = Column(String(16), nullable=False)  # e.g., 'td_live_a1b2'
    key_hash = Column(String(255), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
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

    project = relationship("Project", back_populates="traces")
    agent = relationship("Agent", back_populates="traces")
    events = relationship("TraceEvent", back_populates="trace", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="trace", cascade="all, delete-orphan")
    policy_violations = relationship("PolicyViolation", back_populates="trace", cascade="all, delete-orphan")

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
    updated_at = Column(DateTime, default=datetime.utcnow)
