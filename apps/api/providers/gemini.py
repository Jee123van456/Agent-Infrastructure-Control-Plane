from typing import Dict, Any
from .base import LLMProviderAdapter

class GeminiProvider(LLMProviderAdapter):
    """Google Gemini Telemetry & Pricing Adapter (supports Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash)."""

    # Official pricing per 1M tokens (Input, Output, Cached)
    MODEL_PRICING = {
        "gemini-1.5-pro": {"input": 1.25, "output": 5.00, "cached": 0.3125},
        "gemini-1.5-flash": {"input": 0.075, "output": 0.30, "cached": 0.01875},
        "gemini-2.0-flash": {"input": 0.10, "output": 0.40, "cached": 0.025},
        "gemini-flash": {"input": 0.075, "output": 0.30, "cached": 0.01875},
    }

    DEFAULT_FALLBACK = {"input": 0.075, "output": 0.30, "cached": 0.01875}

    @property
    def provider_name(self) -> str:
        return "google"

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
        usage = raw_response.get("usage_metadata", {})
        prompt_tokens = usage.get("prompt_token_count", 0)
        completion_tokens = usage.get("candidates_token_count", 0)
        cached_tokens = usage.get("cached_content_token_count", 0)
        model = raw_response.get("model", "gemini-1.5-flash")

        return {
            "provider": self.provider_name,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "cached_tokens": cached_tokens,
            "cost_usd": self.calculate_cost(model, prompt_tokens, completion_tokens, cached_tokens),
            "finish_reason": "STOP"
        }
