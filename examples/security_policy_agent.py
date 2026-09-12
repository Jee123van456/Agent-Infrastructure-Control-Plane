#!/usr/bin/env python3
"""
TylerDeck Security Policy Simulation Demo
Simulates an agent execution calling a sensitive tool ('payment_api') configured with REQUIRE_APPROVAL policy.
"""

import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk/python")))

from tylerdeck import TylerDeck

def main():
    print("\n=======================================================")
    print("🛡️  Executing Security Policy Simulation Agent")
    print("=======================================================")

    td = TylerDeck(
        api_key="td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000",
        environment="production"
    )

    user_query = "Process $5,000 disbursement payment to Vendor Acme LLC."
    print(f"Input Query: '{user_query}'")

    with td.trace(
        name="finance_payment_disbursement",
        agent="Finance Execution Agent",
        version="v1.0",
        user_id="usr_finance_mgr"
    ) as trace:
        trace.log_input(user_query)

        # 1. LLM planning
        trace.log_llm_call(
            provider="openai",
            model="gpt-4o",
            prompt_tokens=650,
            completion_tokens=45,
            duration_ms=320.0
        )

        # 2. Sensitive Tool Call - payment_api
        print("  └─ Calling sensitive tool 'payment_api'...")
        trace.log_tool_call(
            name="payment_api",
            tool_category="financial",
            arguments={"vendor": "Acme LLC", "amount": 5000, "currency": "USD"},
            result={"policy": "Finance Approval Policy", "decision": "REQUIRE_APPROVAL", "risk": "HIGH"},
            execution_time_ms=110.0,
            status="ERROR",
            error_details="SECURITY POLICY ACTION: Tool 'payment_api' marked as HIGH risk requiring explicit human approval."
        )

        trace.log_output("SECURITY ACTION: Payment held in PENDING_APPROVAL state. Human sign-off required.")

    td.shutdown()
    print("\n✅ Security Policy Trace successfully recorded on TylerDeck backend!")
    print("   Tool: payment_api")
    print("   Risk Level: HIGH")
    print("   Policy Rule: REQUIRE_APPROVAL")
    print("   Decision: BLOCKED / PENDING APPROVAL")

if __name__ == "__main__":
    main()
