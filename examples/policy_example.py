import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk/python")))

from tylerdeck import TylerDeck

def main():
    td = TylerDeck(
        api_key="td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000"
    )

    print("Executing Policy Verification Trace (Payment API REQUIRE_APPROVAL)...")
    with td.trace(
        name="payment_policy_check_agent",
        agent="financial-agent",
        version="1.0.0"
    ) as trace:
        trace.log_input("Execute payout of $5,000 to merchant_882.")
        
        # 1. Security policy check on sensitive tool
        trace.log_tool_call(
            tool_name="Payment API",
            tool_category="payment",
            arguments={"amount": 5000, "recipient": "merchant_882"},
            result={"policy": "Finance Security Policy", "decision": "REQUIRE_APPROVAL", "risk": "HIGH"},
            execution_time_ms=120.0,
            status="POLICY_VIOLATION",
            error_details="Operation requires human approval before proceeding."
        )
        
        trace.log_output("Payment held for approval per Finance Security Policy.")

    td.exporter.shutdown()
    print("Policy Check Trace dispatched!")

if __name__ == "__main__":
    main()
