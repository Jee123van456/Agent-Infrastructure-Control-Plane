import time
from tylerdeck import TylerDeck

def main():
    td = TylerDeck(
        api_key="td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000"
    )

    print("Executing Anthropic Claude Agent Trace...")
    with td.trace(
        name="anthropic_support_agent",
        agent="claude-support",
        version="2.0.0"
    ) as trace:
        trace.log_input("Summarize user ticket #8492.")
        
        # Log Anthropic LLM call with prompt tokens and completion tokens
        trace.log_llm_call(
            provider="anthropic",
            model="claude-3-5-sonnet",
            prompt_tokens=2450,
            completion_tokens=410,
            temperature=0.2
        )
        
        trace.log_output("Summary: User requested account escalation due to API limit reach.")

    td.exporter.shutdown()
    print("Anthropic Claude Agent Trace dispatched!")

if __name__ == "__main__":
    main()
