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

    print("Executing Tool Agent Trace...")
    with td.trace(
        name="database_query_agent",
        agent="db-agent",
        version="1.2.0"
    ) as trace:
        trace.log_input("Fetch recent customer orders for user_921.")
        
        # 1. LLM planning call
        trace.log_llm_call(
            provider="openai",
            model="gpt-4o-mini",
            prompt_tokens=520,
            completion_tokens=45
        )

        # 2. Tool Execution
        trace.log_tool_call(
            tool_name="Customer Database API",
            tool_category="database",
            arguments={"query": "SELECT * FROM orders WHERE user_id = 'user_921'"},
            result={"order_count": 3, "status": "ACTIVE"},
            execution_time_ms=145.0,
            status="SUCCESS"
        )
        
        trace.log_output("Found 3 active orders for user_921.")

    td.exporter.shutdown()
    print("Tool Agent Trace dispatched!")

if __name__ == "__main__":
    main()
