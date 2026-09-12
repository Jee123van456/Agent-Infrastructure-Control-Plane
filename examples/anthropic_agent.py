#!/usr/bin/env python3
"""
TylerDeck Real Anthropic Integration Test
Executes a live Anthropic Claude request instrumented with TylerDeck if ANTHROPIC_API_KEY is configured.
"""

import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk/python")))

from tylerdeck import TylerDeck

def main():
    api_key_env = os.getenv("ANTHROPIC_API_KEY")
    if not api_key_env:
        print("\n=======================================================")
        print("⚠️  ANTHROPIC_API_KEY environment variable is not set.")
        print("To run a live Anthropic execution through TylerDeck, export your key:")
        print("   export ANTHROPIC_API_KEY='sk-ant-...'")
        print("   python3 examples/anthropic_agent.py")
        print("=======================================================\n")
        return

    try:
        import anthropic
    except ImportError:
        print("The 'anthropic' Python package is not installed. Install via: pip install anthropic")
        return

    print("\n🚀 Executing Live Anthropic Claude Request instrumented with TylerDeck...")

    td = TylerDeck(
        api_key="td_test_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c",
        endpoint="http://localhost:8000"
    )

    client = anthropic.Anthropic(api_key=api_key_env)
    prompt = "In 2 concise sentences, summarize why observability is crucial for autonomous AI agents."

    with td.trace(
        name="live_anthropic_execution",
        agent="anthropic-integration-agent",
        version="v1.0"
    ) as trace:
        trace.log_input(prompt)

        start_time = time.time()
        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        duration_ms = (time.time() - start_time) * 1000.0

        content = message.content[0].text
        usage = message.usage

        prompt_tokens = usage.input_tokens if usage else 0
        completion_tokens = usage.output_tokens if usage else 0

        # Log standardized LLM event
        trace.log_llm_call(
            provider="anthropic",
            model="claude-3-5-haiku",
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            duration_ms=round(duration_ms, 1)
        )

        trace.log_output(content)

    td.shutdown()
    print(f"\nResponse from Anthropic Claude:\n{content}")
    print(f"\n✅ Live Anthropic Telemetry captured: {prompt_tokens} prompt tokens, {completion_tokens} completion tokens, {duration_ms:.1f}ms latency.")

if __name__ == "__main__":
    main()
