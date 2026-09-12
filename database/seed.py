import os
import sys
import random
from datetime import datetime, timedelta, timezone

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from apps.api.database import SessionLocal, engine, Base
from apps.api.models import (
    Organization, User, Project, Agent, AgentVersion, APIKey,
    Trace, TraceEvent, LLMCall, ToolCall, Evaluation, Policy, PolicyViolation, Alert, AlertEvent,
    EvalDataset, DatasetCase, DatasetRun
)
from apps.api.auth import hash_password, generate_api_key, hash_api_key
from apps.api.pricing import calculate_llm_cost
from apps.api.eval_engine import evaluate_trace

def seed_database():
    print("Resetting database schema and initializing seed data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Create Organization
        org = Organization(
            name="Acme AI Technologies",
            slug="acme-ai-corp"
        )
        db.add(org)
        db.flush()

        # 2. Create User
        user = User(
            organization_id=org.id,
            email="alex@acmeai.com",
            hashed_password=hash_password("password123"),
            full_name="Alex Mercer (CTO)",
            role="owner"
        )
        db.add(user)
        db.flush()

        # 3. Create Project
        project = Project(
            organization_id=org.id,
            name="Production AI Control Plane",
            description="Main production project monitoring customer support, research, and financial AI agents."
        )
        db.add(project)
        db.flush()

        # 4. Create API Key
        raw_key, prefix, key_hash = generate_api_key()
        # Ensure we have a known test API key prefix
        test_raw_key = "td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c"
        test_key_prefix = test_raw_key[:12]
        test_key_hash = hash_api_key(test_raw_key)

        api_key = APIKey(
            project_id=project.id,
            name="Production SDK Key",
            key_prefix=test_key_prefix,
            key_hash=test_key_hash,
            is_active=True,
            last_used_at=datetime.now(timezone.utc)
        )
        db.add(api_key)
        db.flush()

        # 5. Create Agents
        # Agent A: Customer Support Agent (Has v1.4 and v1.5 for Regression testing)
        support_agent = Agent(
            project_id=project.id,
            name="Customer Support Agent",
            description="Autonomous agent handling order lookups, refunds, and shipping inquiries.",
            current_version="v1.5"
        )
        db.add(support_agent)
        db.flush()

        db.add(AgentVersion(agent_id=support_agent.id, version="v1.4", changelog="Stable baseline version with GPT-4o-mini"))
        db.add(AgentVersion(agent_id=support_agent.id, version="v1.5", changelog="Added complex multi-tool retrieval routing with GPT-4o"))

        # Agent B: Research Agent
        research_agent = Agent(
            project_id=project.id,
            name="Market Research Agent",
            description="Retrieves market telemetry, vector embeddings, and summarizes competitor documents.",
            current_version="v1.0"
        )
        db.add(research_agent)
        db.flush()
        db.add(AgentVersion(agent_id=research_agent.id, version="v1.0", changelog="Initial production release with Claude 3.5 Sonnet"))

        # Agent C: Finance Agent (With Security Violations)
        finance_agent = Agent(
            project_id=project.id,
            name="Finance Execution Agent",
            description="Processes invoices, bank account queries, and payment disbursements.",
            current_version="v1.0"
        )
        db.add(finance_agent)
        db.flush()
        db.add(AgentVersion(agent_id=finance_agent.id, version="v1.0", changelog="Initial finance agent release"))

        # 6. Create Security Policies
        pol1 = Policy(agent_id=finance_agent.id, tool_name="bank_account_query", action_permission="ALLOW", risk_level="LOW")
        pol2 = Policy(agent_id=finance_agent.id, tool_name="invoice_generator", action_permission="ALLOW", risk_level="LOW")
        pol3 = Policy(agent_id=finance_agent.id, tool_name="payment_api", action_permission="REQUIRE_APPROVAL", risk_level="HIGH")
        pol4 = Policy(agent_id=finance_agent.id, tool_name="shell_execution", action_permission="BLOCK", risk_level="CRITICAL")

        db.add_all([pol1, pol2, pol3, pol4])
        db.flush()

        # 7. Generate Traces for Support Agent v1.4 (20 successful, high quality runs)
        now = datetime.now(timezone.utc)
        for i in range(20):
            t_time = now - timedelta(hours=random.randint(24, 72))
            tr = Trace(
                project_id=project.id,
                agent_id=support_agent.id,
                trace_id_external=f"tr_v14_sup_{i+100}",
                name="Order Inquiry Flow",
                environment="production",
                agent_version="v1.4",
                status="SUCCESS",
                user_id_external=f"usr_support_{i+1}",
                input_text="Where is my order #ORD-9912?",
                output_text="Your order #ORD-9912 is currently in transit and scheduled for delivery tomorrow.",
                total_duration_ms=round(random.uniform(1800.0, 2400.0), 1),
                total_input_tokens=1420,
                total_output_tokens=310,
                total_cost_usd=0.012,
                created_at=t_time
            )
            db.add(tr)
            db.flush()

            # Events
            ev1 = TraceEvent(
                trace_id=tr.id,
                event_type="llm_call",
                name="LLM: OpenAI/gpt-4o-mini",
                duration_ms=620.0,
                inputs={"query": "Where is my order #ORD-9912?"},
                outputs={"intent": "order_search"},
                status="SUCCESS",
                start_time=t_time,
                end_time=t_time + timedelta(milliseconds=620)
            )
            db.add(ev1)
            db.flush()
            db.add(LLMCall(trace_event_id=ev1.id, provider="openai", model="gpt-4o-mini", prompt_tokens=1200, completion_tokens=80, cost_usd=0.0003))

            ev2 = TraceEvent(
                trace_id=tr.id,
                event_type="tool_call",
                name="Tool: customer_db_search",
                duration_ms=180.0,
                inputs={"order_id": "ORD-9912"},
                outputs={"status": "in_transit", "eta": "2026-09-12"},
                status="SUCCESS",
                start_time=t_time + timedelta(milliseconds=620),
                end_time=t_time + timedelta(milliseconds=800)
            )
            db.add(ev2)
            db.flush()
            db.add(ToolCall(trace_event_id=ev2.id, tool_name="customer_db_search", tool_category="database", arguments={"order_id": "ORD-9912"}, result={"status": "in_transit"}, execution_time_ms=180.0, status="SUCCESS"))

            # Eval
            ev_rec = evaluate_trace(tr, [ev1, ev2])
            db.add(ev_rec)

        # 8. Generate Traces for Support Agent v1.5 (REGRESSION: 25 runs, 7 failures, longer latency, tool timeouts)
        for i in range(25):
            t_time = now - timedelta(hours=random.randint(1, 12))
            is_fail = (i % 3 == 0)  # ~33% failure rate in v1.5
            status_val = "ERROR" if is_fail else "SUCCESS"
            err_msg = "Tool execution 'order_database_search' timed out after 5000ms" if is_fail else None

            tr = Trace(
                project_id=project.id,
                agent_id=support_agent.id,
                trace_id_external=f"tr_v15_sup_{i+200}",
                name="Order Inquiry Flow v1.5",
                environment="production",
                agent_version="v1.5",
                status=status_val,
                user_id_external=f"usr_support_{i+20}",
                input_text="Track my return status for order #ORD-4410",
                output_text=None if is_fail else "Return received and refund of $49.00 issued to original payment method.",
                total_duration_ms=round(random.uniform(5200.0, 7800.0) if is_fail else random.uniform(3800.0, 4800.0), 1),
                total_input_tokens=3450,
                total_output_tokens=780,
                total_cost_usd=0.038,
                error_message=err_msg,
                created_at=t_time
            )
            db.add(tr)
            db.flush()

            # Events
            ev1 = TraceEvent(
                trace_id=tr.id,
                event_type="llm_call",
                name="LLM: OpenAI/gpt-4o",
                duration_ms=1450.0,
                inputs={"query": "Track my return status"},
                outputs={"reasoning": "Calling order database and refund processor"},
                status="SUCCESS",
                start_time=t_time,
                end_time=t_time + timedelta(milliseconds=1450)
            )
            db.add(ev1)
            db.flush()
            db.add(LLMCall(trace_event_id=ev1.id, provider="openai", model="gpt-4o", prompt_tokens=2800, completion_tokens=420, cost_usd=0.011))

            ev2 = TraceEvent(
                trace_id=tr.id,
                event_type="tool_call",
                name="Tool: order_database_search",
                duration_ms=5000.0 if is_fail else 420.0,
                inputs={"order_id": "ORD-4410"},
                outputs=None if is_fail else {"return_status": "processed"},
                status="ERROR" if is_fail else "SUCCESS",
                start_time=t_time + timedelta(milliseconds=1450),
                end_time=t_time + timedelta(milliseconds=6450 if is_fail else 1870)
            )
            db.add(ev2)
            db.flush()
            db.add(ToolCall(
                trace_event_id=ev2.id,
                tool_name="order_database_search",
                tool_category="database",
                arguments={"order_id": "ORD-4410"},
                result=None if is_fail else {"return_status": "processed"},
                execution_time_ms=5000.0 if is_fail else 420.0,
                status="TIMEOUT" if is_fail else "SUCCESS",
                error_details=err_msg
            ))

            ev_rec = evaluate_trace(tr, [ev1, ev2])
            db.add(ev_rec)

        # 9. Generate Traces for Research Agent (Anthropic Claude 3.5 Sonnet)
        for i in range(15):
            t_time = now - timedelta(hours=random.randint(2, 36))
            tr = Trace(
                project_id=project.id,
                agent_id=research_agent.id,
                trace_id_external=f"tr_res_{i+300}",
                name="Competitive Intelligence Research",
                environment="production",
                agent_version="v1.0",
                status="SUCCESS",
                user_id_external=f"usr_research_{i+1}",
                input_text="Analyze market pricing for LLM observability platforms",
                output_text="LangSmith charges $39/seat/mo, Langfuse charges $29/mo with unlimited users, Helicone charges $79/mo.",
                total_duration_ms=round(random.uniform(3200.0, 4500.0), 1),
                total_input_tokens=4200,
                total_output_tokens=650,
                total_cost_usd=0.022,
                created_at=t_time
            )
            db.add(tr)
            db.flush()

            ev1 = TraceEvent(
                trace_id=tr.id,
                event_type="llm_call",
                name="LLM: Anthropic/claude-3-5-sonnet",
                duration_ms=1800.0,
                inputs={"prompt": "Analyze pricing"},
                outputs={"text": "Searching web and vector store..."},
                status="SUCCESS"
            )
            db.add(ev1)
            db.flush()
            db.add(LLMCall(trace_event_id=ev1.id, provider="anthropic", model="claude-3-5-sonnet", prompt_tokens=3800, completion_tokens=550, cost_usd=0.019))

            ev2 = TraceEvent(
                trace_id=tr.id,
                event_type="tool_call",
                name="Tool: web_search",
                duration_ms=850.0,
                inputs={"query": "LLM observability pricing 2026"},
                outputs={"results_count": 8},
                status="SUCCESS"
            )
            db.add(ev2)
            db.flush()
            db.add(ToolCall(trace_event_id=ev2.id, tool_name="web_search", tool_category="search", arguments={"query": "LLM observability pricing"}, result={"results": 8}, execution_time_ms=850.0, status="SUCCESS"))

            ev_rec = evaluate_trace(tr, [ev1, ev2])
            db.add(ev_rec)

        # 10. Generate Traces for Finance Agent (Including Security Policy Violation Blocks)
        for i in range(10):
            t_time = now - timedelta(hours=random.randint(1, 18))
            is_policy_violation = (i % 2 == 1)

            tr = Trace(
                project_id=project.id,
                agent_id=finance_agent.id,
                trace_id_external=f"tr_fin_{i+400}",
                name="Invoice Disbursement Flow",
                environment="production",
                agent_version="v1.0",
                status="POLICY_VIOLATION" if is_policy_violation else "SUCCESS",
                user_id_external=f"usr_fin_{i+1}",
                input_text="Process invoice payment of $4,500 to Vendor X",
                output_text="SECURITY BLOCK: Unapproved execution of payment API without human sign-off." if is_policy_violation else "Invoice retrieved successfully.",
                total_duration_ms=round(random.uniform(900.0, 1500.0), 1),
                total_input_tokens=1850,
                total_output_tokens=220,
                total_cost_usd=0.008,
                error_message="SECURITY ALERT: Unapproved execution of high-risk payment API" if is_policy_violation else None,
                created_at=t_time
            )
            db.add(tr)
            db.flush()

            if is_policy_violation:
                pv = PolicyViolation(
                    trace_id=tr.id,
                    policy_id=pol3.id,
                    action_attempted="Executed sensitive tool 'payment_api' requiring explicit human approval",
                    severity="HIGH",
                    status="AUDITED",
                    created_at=t_time
                )
                db.add(pv)

            ev1 = TraceEvent(
                trace_id=tr.id,
                event_type="tool_call",
                name="Tool: payment_api" if is_policy_violation else "Tool: bank_account_query",
                duration_ms=320.0,
                inputs={"vendor": "Vendor X", "amount": 4500},
                outputs={"status": "blocked_by_policy"} if is_policy_violation else {"balance": 142000},
                status="ERROR" if is_policy_violation else "SUCCESS"
            )
            db.add(ev1)
            db.flush()
            db.add(ToolCall(
                trace_event_id=ev1.id,
                tool_name="payment_api" if is_policy_violation else "bank_account_query",
                tool_category="payment" if is_policy_violation else "database",
                arguments={"amount": 4500},
                result={"status": "blocked"},
                execution_time_ms=320.0,
                status="ERROR" if is_policy_violation else "SUCCESS"
            ))

            ev_rec = evaluate_trace(tr, [ev1])
            db.add(ev_rec)

        # 11. Create System Alerts & Alert Events
        alt1 = Alert(
            agent_id=support_agent.id,
            name="Customer Support Success Rate Drop",
            metric_type="success_rate",
            threshold_value=90.0,
            condition="less_than",
            is_active=True
        )
        db.add(alt1)
        db.flush()

        db.add(AlertEvent(
            alert_id=alt1.id,
            message="🚨 AGENT REGRESSION DETECTED: Customer Support Agent success rate dropped from 94.2% (v1.4) to 82.1% (v1.5).",
            current_value=82.1,
            severity="CRITICAL",
            created_at=now - timedelta(minutes=45)
        ))

        # 12. Create Evaluation Dataset: Customer Support Regression (10 Test Cases)
        eval_ds = EvalDataset(
            project_id=project.id,
            name="Customer Support Regression",
            description="Continuous benchmarking dataset for verifying customer support agent routing and tool execution correctness across release versions."
        )
        db.add(eval_ds)
        db.flush()

        test_cases_data = [
            ("Where is my order #ORD-101?", "customer_db_search", "delivered"),
            ("Track package for order #ORD-102", "order_database_search", "in transit"),
            ("Issue refund for item #ORD-103", "refund_processor", "refund issued"),
            ("Cancel order #ORD-104", "order_cancellation_api", "cancelled"),
            ("Change shipping address for #ORD-105", "address_updater", "updated"),
            ("Get invoice receipt for #ORD-106", "invoice_generator", "receipt"),
            ("Check return eligibility for #ORD-107", "return_policy_checker", "eligible"),
            ("Track return package #ORD-108", "return_tracker", "received"),
            ("Apply promo discount code #ORD-109", "discount_api", "applied"),
            ("Check warranty status for order #ORD-110", "warranty_checker", "valid")
        ]

        for input_q, expected_t, expected_o in test_cases_data:
            db.add(DatasetCase(
                dataset_id=eval_ds.id,
                input_query=input_q,
                expected_tool=expected_t,
                expected_output_contains=expected_o
            ))

        # Benchmark Run v1.0: 10 cases, 9 passed, 1 failed -> Score 90.0%
        db.add(DatasetRun(
            dataset_id=eval_ds.id,
            agent_id=support_agent.id,
            agent_version="v1.0",
            total_cases=10,
            passed_cases=9,
            pass_rate_percent=90.0,
            created_at=now - timedelta(days=2)
        ))

        # Benchmark Run v1.1: 10 cases, 7 passed, 3 failed -> Score 70.0% (REGRESSION DETECTED!)
        db.add(DatasetRun(
            dataset_id=eval_ds.id,
            agent_id=support_agent.id,
            agent_version="v1.1",
            total_cases=10,
            passed_cases=7,
            pass_rate_percent=70.0,
            created_at=now - timedelta(hours=2)
        ))

        db.commit()
        print("Database successfully seeded with realistic production agent traces, evaluations, security policy violations, and version regression data!")
        print(f"User Login: alex@acmeai.com / password123")
        print(f"SDK Test Key: {test_raw_key}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
