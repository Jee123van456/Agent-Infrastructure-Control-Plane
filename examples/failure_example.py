import time
from tylerdeck import TylerDeck

def main():
    td = TylerDeck(
        api_key="td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000"
    )

    print("Executing Failure Agent Trace (Order API Timeout)...")
    with td.trace(
        name="customer_support_failure_run",
        agent="support-agent",
        version="1.5.0"
    ) as trace:
        trace.log_input("Cancel order #99201 and issue refund.")
        
        # 1. LLM planning
        trace.log_llm_call(
            provider="openai",
            model="gpt-4o",
            prompt_tokens=850,
            completion_tokens=60
        )

        # 2. Tool Failure: Order API Timeout
        trace.log_tool_call(
            tool_name="Order API",
            tool_category="api",
            arguments={"order_id": "99201", "action": "cancel"},
            result=None,
            execution_time_ms=8200.0,
            status="TIMEOUT",
            error_details="Connection reset by peer after 8.2 seconds timeout."
        )
        
        trace.log_output("Failed to process order cancellation due to upstream Order API timeout.")

    td.exporter.shutdown()
    print("Failure Agent Trace dispatched to TylerDeck! (Failure cluster & alert updated)")

if __name__ == "__main__":
    main()
