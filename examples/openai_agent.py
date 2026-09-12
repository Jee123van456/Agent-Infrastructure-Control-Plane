#!/usr/bin/env python3
"""
TylerDeck Real OpenAI Integration Test
Executes a live OpenAI request instrumented with TylerDeck if OPENAI_API_KEY is configured.
"""

import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk/python")))

from tylerdeck import TylerDeck

def main():
    api_key_env = os.getenv("OPENAI_API_KEY")
    if not api_key_env:
        print("\n=======================================================")
        print("⚠️  OPENAI_API_KEY environment variable is not set.")
        print("To run a live OpenAI execution through TylerDeck, export your key:")
        print("   export OPENAI_API_KEY='sk-...'")
        print("   python3 examples/openai_agent.py")
        print("=======================================================\n")
        return

    try:
        import openai
    except ImportError:
        print("The 'openai' Python package is not installed. Install via: pip install openai")
        return

    print("\n🚀 Executing Live OpenAI Request instrumented with TylerDeck...")

    td = TylerDeck(
        api_key="td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000"
    )

    client = openai.OpenAI(api_key=api_key_env)
    prompt = "In 2 concise sentences, summarize why observability is crucial for autonomous AI agents."

    with td.trace(
        name="live_openai_execution",
        agent="openai-integration-agent",
        version="v1.0"
    ) as trace:
        trace.log_input(prompt)

        start_time = time.time()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        duration_ms = (time.time() - start_time) * 1000.0

        content = response.choices[0].message.content
        usage = response.usage

        prompt_tokens = usage.prompt_tokens if usage else 0
        completion_tokens = usage.completion_tokens if usage else 0

        # Log standardized LLM event
        trace.log_llm_call(
            provider="openai",
            model="gpt-4o-mini",
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            duration_ms=round(duration_ms, 1)
        )

        trace.log_output(content)

    td.shutdown()
    print(f"\nResponse from OpenAI:\n{content}")
    print(f"\n✅ Live OpenAI Telemetry captured: {prompt_tokens} prompt tokens, {completion_tokens} completion tokens, {duration_ms:.1f}ms latency.")

if __name__ == "__main__":
    main()
