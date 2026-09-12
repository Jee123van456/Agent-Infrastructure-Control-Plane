"""
Centralized Model Pricing Engine for TylerDeck.
Delegates to provider adapters for OpenAI, Anthropic, Gemini, and custom LLM providers.
Provides standardized pricing metadata (source, effective_date, currency, estimated flag).
"""

from typing import Dict, Any
from apps.api.providers.factory import get_provider_adapter

CENTRAL_PRICING_METADATA = {
    "source": "Official Provider Documentation & API Rate Cards",
    "effective_date": "2026-01-01",
    "currency": "USD"
}

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

def get_pricing_detail(model_name: str, prompt_tokens: int, completion_tokens: int, provider: str = "openai", cached_tokens: int = 0) -> Dict[str, Any]:
    """
    Returns complete pricing calculation with metadata (source, effective_date, currency, estimated flag).
    """
    adapter = get_provider_adapter(provider)
    cost = adapter.calculate_cost(
        model=model_name or "gpt-4o",
        prompt_tokens=prompt_tokens or 0,
        completion_tokens=completion_tokens or 0,
        cached_tokens=cached_tokens or 0
    )
    
    # Check if model exists in provider's pricing registry
    is_known = hasattr(adapter, 'MODEL_PRICING') and (model_name.lower() in getattr(adapter, 'MODEL_PRICING', {}))

    return {
        "cost_usd": cost,
        "pricing_source": CENTRAL_PRICING_METADATA["source"],
        "effective_date": CENTRAL_PRICING_METADATA["effective_date"],
        "currency": CENTRAL_PRICING_METADATA["currency"],
        "estimated": not is_known
    }
