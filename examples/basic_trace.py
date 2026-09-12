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

    print("Executing Basic Agent Trace...")
    with td.trace(
        name="basic_greeting_agent",
        agent="greeting-agent",
        version="1.0.0"
    ) as trace:
        trace.input("User: Hello, introduce yourself!")
        
        # Simulate LLM thinking time
        time.sleep(0.2)
        trace.generation(
            provider="openai",
            model="gpt-4o",
            prompt_tokens=40,
            completion_tokens=25,
            input="Introduce yourself as an AI assistant.",
            output="Hello! I am TylerDeck AI assistant.",
            latency_ms=210.0
        )
        
        trace.output("Hello! I am TylerDeck AI assistant.")

    td.exporter.shutdown()
    print("Trace successfully dispatched to TylerDeck!")

if __name__ == "__main__":
    main()
