from typing import Dict
from .base import LLMProviderAdapter
from .openai import OpenAIProvider
from .anthropic import AnthropicProvider
from .gemini import GeminiProvider

_ADAPTER_REGISTRY: Dict[str, LLMProviderAdapter] = {
    "openai": OpenAIProvider(),
    "anthropic": AnthropicProvider(),
    "google": GeminiProvider(),
    "gemini": GeminiProvider(),
}

def get_provider_adapter(provider_name: str) -> LLMProviderAdapter:
    """
    Returns the appropriate LLMProviderAdapter instance for a given provider string.
    Defaults to OpenAIProvider if unknown.
    """
    key = (provider_name or "openai").strip().lower()
    return _ADAPTER_REGISTRY.get(key, _ADAPTER_REGISTRY["openai"])
