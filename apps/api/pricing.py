"""
Model Pricing Abstraction Engine for TylerDeck
Provides centralized pricing per 1M tokens for OpenAI, Anthropic, Gemini, and other providers.
Calculates exact estimated USD cost for traces and LLM calls.
"""

# Pricing table in USD per 1,000,000 tokens (Updated for 2026 rates)
MODEL_PRICING_TABLE = {
    # OpenAI
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-2024-08-06": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "o1-preview": {"input": 15.00, "output": 60.00},
    "o1-mini": {"input": 3.00, "output": 12.00},

    # Anthropic
    "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00},
    "claude-3-5-sonnet": {"input": 3.00, "output": 15.00},
    "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
    "claude-3-5-haiku": {"input": 1.00, "output": 5.00},
    "claude-3-opus-20240229": {"input": 15.00, "output": 75.00},

    # Google Gemini
    "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
    "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
    "gemini-2.0-flash": {"input": 0.10, "output": 0.40},

    # Mistral / Cohere / Default fallback
    "mistral-large": {"input": 2.00, "output": 6.00},
    "mistral-small": {"input": 0.20, "output": 0.60},
    "default": {"input": 1.00, "output": 3.00}
}

def calculate_llm_cost(model_name: str, prompt_tokens: int, completion_tokens: int) -> float:
    """
    Calculates estimated USD cost for a given model based on prompt and completion token counts.
    """
    clean_model = (model_name or "").lower().strip()
    
    pricing = MODEL_PRICING_TABLE.get("default")
    for known_model, rates in MODEL_PRICING_TABLE.items():
        if known_model in clean_model:
            pricing = rates
            break

    input_cost = (prompt_tokens / 1_000_000.0) * pricing["input"]
    output_cost = (completion_tokens / 1_000_000.0) * pricing["output"]
    
    return round(input_cost + output_cost, 6)
