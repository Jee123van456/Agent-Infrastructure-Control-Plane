import time
from tylerdeck import TylerDeck

def main():
    td = TylerDeck(
        api_key="td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000"
    )

    print("Executing Basic Agent Trace...")
    with td.trace(
        name="basic_greeting_agent",
        agent="greeting-agent",
        version="1.0.0"
    ) as trace:
        trace.log_input("User: Hello, introduce yourself!")
        
        # Simulate LLM thinking time
        time.sleep(0.2)
        trace.log_event(
            event_type="llm_call",
            name="LLM: openai/gpt-4o",
            duration_ms=210.0,
            inputs={"prompt": "Introduce yourself as an AI assistant."},
            outputs={"response": "Hello! I am TylerDeck AI assistant."}
        )
        
        trace.log_output("Hello! I am TylerDeck AI assistant.")

    td.exporter.shutdown()
    print("Trace successfully dispatched to TylerDeck!")

if __name__ == "__main__":
    main()
