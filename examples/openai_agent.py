import time
from tylerdeck import TylerDeck

def main():
    td = TylerDeck(
        api_key="td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000"
    )

    print("Executing OpenAI Agent Trace...")
    with td.trace(
        name="openai_reasoning_agent",
        agent="openai-agent",
        version="1.1.0"
    ) as trace:
        trace.log_input("Analyze market trends for Q3 2026.")
        
        # Log OpenAI LLM call
        trace.log_llm_call(
            provider="openai",
            model="gpt-4o",
            prompt_tokens=1420,
            completion_tokens=380,
            temperature=0.3
        )
        
        trace.log_output("Q3 2026 Market Analysis: Strong growth in AI Agent Governance infrastructure.")

    td.exporter.shutdown()
    print("OpenAI Agent Trace dispatched!")

if __name__ == "__main__":
    main()
