#!/usr/bin/env python3
"""
TylerDeck Real Local Demo Agent — Customer Support Agent
Simulates an autonomous customer support agent instrumented with the TylerDeck Python SDK.

Supports two scenarios:
  1. Scenario A — SUCCESS: User Question -> LLM -> Customer DB -> Order API -> LLM -> Response
  2. Scenario B — FAILURE: Forced Order API Timeout (Trace ERROR, TOOL_TIMEOUT)

Usage:
  python3 examples/customer_support_agent.py --scenario success
  python3 examples/customer_support_agent.py --scenario failure
"""

import sys
import os
import time
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk/python")))

from tylerdeck import TylerDeck

# --- Deterministic Local Business Tools ---
def query_customer_database(user_id: str) -> dict:
    """Queries local customer database for account details."""
    time.sleep(0.15)  # Simulate DB latency (150ms)
    return {
        "user_id": user_id,
        "name": "Sarah Connor",
        "membership_tier": "VIP Gold",
        "active_orders": ["ORD-88219", "ORD-99120"]
    }

def call_order_api(order_id: str, action: str = "status", force_timeout: bool = False) -> dict:
    """Calls Order Fulfillment API to fetch order tracking status or process return."""
    if force_timeout:
        time.sleep(5.0)  # Simulate timeout duration
        raise TimeoutError(f"Order API timed out after 5000ms while accessing order {order_id}")
    
    time.sleep(0.25)  # Simulate API latency (250ms)
    return {
        "order_id": order_id,
        "status": "IN_TRANSIT",
        "carrier": "FedEx Express",
        "tracking_number": "TRK-9821471029",
        "estimated_delivery": "Tomorrow by 3:00 PM"
    }

def run_customer_support_agent(scenario: str = "success", endpoint: str = "http://localhost:8000", api_key: str = "td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c"):
    print(f"\n=======================================================")
    print(f"🚀 Initializing Customer Support Agent Scenario: {scenario.upper()}")
    print(f"=======================================================")

    td = TylerDeck(
        api_key=api_key,
        endpoint=endpoint,
        environment="production"
    )

    version_str = "v1.0" if scenario == "success" else "v1.1"
    user_query = "Where is my order #ORD-88219 and when will it arrive?"

    print(f"Input Query: '{user_query}'")

    try:
        with td.trace(
            name="customer_support_inquiry",
            agent="Customer Support Agent",
            version=version_str,
            user_id="usr_sarah_c"
        ) as trace:
            trace.log_input(user_query)

            # Step 1: Initial LLM Intent Recognition & Routing Call
            print("  └─ [1/5] LLM Intent Classification (GPT-4o-mini)...")
            start_llm1 = time.time()
            time.sleep(0.3)  # LLM duration simulation
            llm1_duration = (time.time() - start_llm1) * 1000.0
            
            trace.log_llm_call(
                provider="openai",
                model="gpt-4o-mini",
                prompt_tokens=420,
                completion_tokens=65,
                duration_ms=round(llm1_duration, 1)
            )

            # Step 2: Customer Database Query Tool
            print("  └─ [2/5] Tool Call: customer_database...")
            start_db = time.time()
            db_res = query_customer_database("usr_sarah_c")
            db_duration = (time.time() - start_db) * 1000.0

            trace.log_tool_call(
                name="customer_database",
                tool_category="database",
                arguments={"user_id": "usr_sarah_c"},
                result=db_res,
                execution_time_ms=round(db_duration, 1),
                status="SUCCESS"
            )

            # Step 3: Order API Tool (Success or Forced Timeout)
            print(f"  └─ [3/5] Tool Call: order_api (force_timeout={scenario == 'failure'})...")
            start_api = time.time()
            if scenario == "failure":
                try:
                    order_res = call_order_api("ORD-88219", action="status", force_timeout=True)
                except Exception as exc:
                    api_duration = (time.time() - start_api) * 1000.0
                    trace.log_tool_call(
                        name="order_api",
                        tool_category="api",
                        arguments={"order_id": "ORD-88219", "action": "status"},
                        result=None,
                        execution_time_ms=round(api_duration, 1),
                        status="TIMEOUT",
                        error_details=str(exc)
                    )
                    raise exc
            else:
                order_res = call_order_api("ORD-88219", action="status", force_timeout=False)
                api_duration = (time.time() - start_api) * 1000.0
                trace.log_tool_call(
                    name="order_api",
                    tool_category="api",
                    arguments={"order_id": "ORD-88219", "action": "status"},
                    result=order_res,
                    execution_time_ms=round(api_duration, 1),
                    status="SUCCESS"
                )

            # Step 4: Final LLM Synthesis Call
            print("  └─ [4/5] LLM Final Response Synthesis (GPT-4o)...")
            start_llm2 = time.time()
            time.sleep(0.4)
            llm2_duration = (time.time() - start_llm2) * 1000.0

            trace.log_llm_call(
                provider="openai",
                model="gpt-4o",
                prompt_tokens=890,
                completion_tokens=140,
                duration_ms=round(llm2_duration, 1)
            )

            # Step 5: Log Final Output
            final_response = f"Hello Sarah! Your order #ORD-88219 is currently IN_TRANSIT with FedEx Express (Tracking: TRK-9821471029) and scheduled for delivery tomorrow by 3:00 PM."
            trace.log_output(final_response)
            print("  └─ [5/5] Final Response Generated.")

    except Exception as e:
        print(f"\n⚠️  Agent execution caught error as expected: {e}")
    finally:
        td.shutdown()
        print(f"\n✅ Trace telemetry successfully dispatched to TylerDeck at {endpoint}!")

def main():
    parser = argparse.ArgumentParser(description="TylerDeck Customer Support Agent Demo")
    parser.add_argument("--scenario", choices=["success", "failure"], default="success", help="Scenario to run: 'success' (Scenario A) or 'failure' (Scenario B timeout)")
    parser.add_argument("--endpoint", default="http://localhost:8000", help="TylerDeck API endpoint")
    parser.add_argument("--api-key", default="td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c", help="TylerDeck Project API Key")
    args = parser.parse_args()

    run_customer_support_agent(scenario=args.scenario, endpoint=args.endpoint, api_key=args.api_key)

if __name__ == "__main__":
    main()
