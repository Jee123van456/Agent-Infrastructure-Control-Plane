from typing import Dict, Any
from .base import LLMProviderAdapter

class AnthropicProvider(LLMProviderAdapter):
    """Anthropic Telemetry & Pricing Adapter (supports Claude 3.5 Sonnet, Claude 3.5 Haiku, Opus, etc.)."""

    # Official pricing per 1M tokens (Input, Output, Cached Read)
    MODEL_PRICING = {
        "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00, "cached": 0.30},
        "claude-3-5-sonnet": {"input": 3.00, "output": 15.00, "cached": 0.30},
        "claude-3-5-haiku": {"input": 1.00, "output": 5.00, "cached": 0.10},
        "claude-3-haiku": {"input": 0.25, "output": 1.25, "cached": 0.03},
        "claude-3-opus": {"input": 15.00, "output": 75.00, "cached": 1.50},
    }

    DEFAULT_FALLBACK = {"input": 3.00, "output": 15.00, "cached": 0.30}

    @property
    def provider_name(self) -> str:
        return "anthropic"

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
        prompt_tokens = usage.get("input_tokens", 0)
        completion_tokens = usage.get("output_tokens", 0)
        cached_tokens = usage.get("cache_read_input_tokens", 0)
        model = raw_response.get("model", "claude-3-5-sonnet")

        return {
            "provider": self.provider_name,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "cached_tokens": cached_tokens,
            "cost_usd": self.calculate_cost(model, prompt_tokens, completion_tokens, cached_tokens),
            "finish_reason": raw_response.get("stop_reason", "end_turn")
        }
