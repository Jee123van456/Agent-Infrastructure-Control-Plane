import re
from typing import Any, Dict, List, Union

SECRET_PATTERNS = [
    (re.compile(r'sk-[a-zA-Z0-9_-]{20,}'), '[REDACTED_OPENAI_KEY]'),
    (re.compile(r'sk-ant-api[a-zA-Z0-9_-]{20,}'), '[REDACTED_ANTHROPIC_KEY]'),
    (re.compile(r'Bearer\s+[a-zA-Z0-9_\-\.=]+', re.IGNORECASE), 'Bearer [REDACTED]'),
    (re.compile(r'td_live_[a-zA-Z0-9]{16,}'), '[REDACTED_TYLERDECK_KEY]'),
    (re.compile(r'AKIA[0-9A-Z]{16}'), '[REDACTED_AWS_KEY]'),
    (re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'), '[REDACTED_EMAIL]'),
    (re.compile(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'), '[REDACTED_PHONE]'),
    (re.compile(r'\b\d{3}-\d{2}-\d{4}\b'), '[REDACTED_SSN]'),
    (re.compile(r'\b(?:\d[ -]*?){13,16}\b'), '[REDACTED_CARD_NUMBER]'),
]

SENSITIVE_KEYS = {'password', 'secret', 'token', 'api_key', 'authorization', 'access_token', 'private_key'}

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
