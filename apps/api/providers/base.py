from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class LLMProviderAdapter(ABC):
    """Abstract base class for all LLM provider telemetry adapters."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns the canonical provider name (e.g. 'openai', 'anthropic', 'google')."""
        pass

    @abstractmethod
    def calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int, cached_tokens: int = 0) -> float:
        """Calculates estimated cost in USD based on official token pricing."""
        pass

    @abstractmethod
    def normalize_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes provider-specific completion payloads into standardized telemetry metrics."""
        pass
