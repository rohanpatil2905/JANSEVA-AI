import os
from typing import Literal

AI_PROVIDER = os.getenv('AI_PROVIDER', 'openai_compatible').lower()
AI_MODEL = os.getenv('AI_MODEL', 'gpt-4o-mini')
AI_BASE_URL = os.getenv('AI_BASE_URL', 'https://api.openai.com/v1')
AI_API_KEY = os.getenv('AI_API_KEY', '').strip()
AI_TIMEOUT_SECONDS = int(os.getenv('AI_TIMEOUT_SECONDS', '30'))
AI_RETRY_ATTEMPTS = int(os.getenv('AI_RETRY_ATTEMPTS', '3'))
AI_SERVICE_KEY = os.getenv('AI_SERVICE_API_KEY', '').strip()

ProviderName = Literal['openai_compatible', 'mock']


def provider_settings() -> dict:
    return {
        'provider': AI_PROVIDER,
        'model': AI_MODEL,
        'base_url': AI_BASE_URL,
        'api_key': AI_API_KEY,
        'timeout_seconds': AI_TIMEOUT_SECONDS,
        'max_retries': AI_RETRY_ATTEMPTS,
        'service_key': AI_SERVICE_KEY,
    }
