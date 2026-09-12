"""
Centralized Model Pricing Engine for TylerDeck.
Delegates to provider adapters for OpenAI, Anthropic, Gemini, and custom LLM providers.
"""

from apps.api.providers.factory import get_provider_adapter

def calculate_llm_cost(model_name: str, prompt_tokens: int, completion_tokens: int, provider: str = "openai", cached_tokens: int = 0) -> float:
    """
    Calculates estimated USD cost for an LLM call using the corresponding provider adapter.
    """
    adapter = get_provider_adapter(provider)
    return adapter.calculate_cost(
        model=model_name or "gpt-4o",
        prompt_tokens=prompt_tokens or 0,
        completion_tokens=completion_tokens or 0,
        cached_tokens=cached_tokens or 0
    )
