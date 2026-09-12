from typing import Dict, Any
from .base import LLMProviderAdapter

class OpenAIProvider(LLMProviderAdapter):
    """OpenAI Telemetry & Pricing Adapter (supports GPT-4o, GPT-4o-mini, o1, o3-mini, etc.)."""

    # Official pricing per 1M tokens (Input, Output, Cached Input)
    MODEL_PRICING = {
        "gpt-4o": {"input": 2.50, "output": 10.00, "cached": 1.25},
        "gpt-4o-2024-08-06": {"input": 2.50, "output": 10.00, "cached": 1.25},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60, "cached": 0.075},
        "gpt-4o-mini-2024-07-18": {"input": 0.15, "output": 0.60, "cached": 0.075},
        "o1": {"input": 15.00, "output": 60.00, "cached": 7.50},
        "o1-mini": {"input": 1.10, "output": 4.40, "cached": 0.55},
        "o3-mini": {"input": 1.10, "output": 4.40, "cached": 0.55},
        "gpt-4-turbo": {"input": 10.00, "output": 30.00, "cached": 5.00},
        "gpt-3.5-turbo": {"input": 0.50, "output": 1.50, "cached": 0.25},
    }

    DEFAULT_FALLBACK = {"input": 2.50, "output": 10.00, "cached": 1.25}

    @property
    def provider_name(self) -> str:
        return "openai"

    def calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int, cached_tokens: int = 0) -> float:
        model_key = model.lower()
        pricing = self.MODEL_PRICING.get(model_key, self.DEFAULT_FALLBACK)
        
        non_cached_prompt = max(0, prompt_tokens - cached_tokens)
        cost = (
            (non_cached_prompt / 1_000_000.0) * pricing["input"] +
            (cached_tokens / 1_000_000.0) * pricing["cached"] +
            (completion_tokens / 1_000_000.0) * pricing["output"]
        )
        return round(cost, 6)

    def normalize_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        usage = raw_response.get("usage", {})
        prompt_tokens = usage.get("prompt_tokens", 0)
        completion_tokens = usage.get("completion_tokens", 0)
        cached_tokens = usage.get("prompt_tokens_details", {}).get("cached_tokens", 0)
        model = raw_response.get("model", "gpt-4o")

        return {
            "provider": self.provider_name,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "cached_tokens": cached_tokens,
            "cost_usd": self.calculate_cost(model, prompt_tokens, completion_tokens, cached_tokens),
            "finish_reason": raw_response.get("choices", [{}])[0].get("finish_reason", "stop")
        }
