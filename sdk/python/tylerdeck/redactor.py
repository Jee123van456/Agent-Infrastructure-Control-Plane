import re
from typing import Any, Dict, List, Union

SECRET_PATTERNS = [
    (re.compile(r'sk-[a-zA-Z0-9]{32,}'), '[REDACTED_OPENAI_KEY]'),
    (re.compile(r'sk-ant-api[a-zA-Z0-9_-]{32,}'), '[REDACTED_ANTHROPIC_KEY]'),
    (re.compile(r'Bearer\s+[a-zA-Z0-9_\-\.=]+'), 'Bearer [REDACTED_TOKEN]'),
    (re.compile(r'td_live_[a-zA-Z0-9]{20,}'), '[REDACTED_TYLERDECK_KEY]'),
    (re.compile(r'\b\d{3}-\d{2}-\d{4}\b'), '[REDACTED_SSN]'),
    (re.compile(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'), '[REDACTED_CARD_NUMBER]'),
]

SENSITIVE_KEYS = {'password', 'secret', 'token', 'api_key', 'authorization', 'access_token'}

def sanitize_data(data: Any) -> Any:
    """
    Recursively redacts sensitive patterns and keys from dictionaries, lists, and strings.
    """
    if isinstance(data, str):
        sanitized = data
        for pattern, replacement in SECRET_PATTERNS:
            sanitized = pattern.sub(replacement, sanitized)
        return sanitized
    elif isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            if str(key).lower() in SENSITIVE_KEYS:
                new_dict[key] = '[REDACTED_SECRET]'
            else:
                new_dict[key] = sanitize_data(value)
        return new_dict
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    return data
