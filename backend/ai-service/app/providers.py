import json
import os
import time
from typing import Any, Dict, List, Literal
from urllib import error, request

AI_PROVIDER = os.getenv('AI_PROVIDER', 'openai_compatible').lower()
AI_MODEL = os.getenv('AI_MODEL', 'gpt-4o-mini')
AI_BASE_URL = os.getenv('AI_BASE_URL', 'https://api.openai.com/v1')
AI_API_KEY = os.getenv('AI_API_KEY', '').strip()
AI_TIMEOUT_SECONDS = int(os.getenv('AI_TIMEOUT_SECONDS', '30'))
AI_RETRY_ATTEMPTS = int(os.getenv('AI_RETRY_ATTEMPTS', '3'))
AI_SERVICE_KEY = os.getenv('AI_SERVICE_API_KEY', '').strip()

ProviderName = Literal['openai_compatible', 'mock']


def provider_settings() -> Dict[str, Any]:
    return {
        'provider': AI_PROVIDER,
        'model': AI_MODEL,
        'base_url': AI_BASE_URL,
        'api_key': AI_API_KEY,
        'timeout_seconds': AI_TIMEOUT_SECONDS,
        'max_retries': AI_RETRY_ATTEMPTS,
        'service_key': AI_SERVICE_KEY,
    }


def _strip_code_fences(text: str) -> str:
    value = text.strip()
    if value.startswith('```'):
        value = value.strip('`')
        if '\n' in value:
            lines = value.splitlines()
            if lines and lines[0].strip().lower() in {'json', 'javascript'}:
                lines = lines[1:]
            value = '\n'.join(lines)
        value = value.strip()
    if value.startswith('```') and value.endswith('```'):
        value = value[3:-3].strip()
    return value


def _parse_json_response(content: Any) -> Dict[str, Any]:
    if isinstance(content, (dict, list)):
        return content
    text = _strip_code_fences(str(content))
    if not text:
        raise ValueError('Empty response payload from AI provider')
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f'AI provider did not return valid JSON: {text[:300]}') from exc
    if not isinstance(parsed, dict):
        raise ValueError('AI provider response is not a JSON object')
    return parsed


def _chat_completion_url() -> str:
    base_url = str(provider_settings()['base_url']).rstrip('/')
    return f'{base_url}/chat/completions'


def _provider_headers() -> Dict[str, str]:
    settings = provider_settings()
    api_key = (settings.get('api_key') or '').strip()
    if not api_key:
        raise RuntimeError('AI_API_KEY is not configured; no real provider can be called.')
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}',
    }


def _call_openai_compatible(messages: List[Dict[str, str]], response_format: str = 'json_object') -> Dict[str, Any]:
    settings = provider_settings()
    payload = {
        'model': settings.get('model', 'gpt-4o-mini'),
        'messages': messages,
        'temperature': 0.2,
        'response_format': {'type': response_format},
    }
    headers = _provider_headers()
    body = json.dumps(payload).encode('utf-8')
    req = request.Request(_chat_completion_url(), data=body, headers=headers, method='POST')

    last_error: Exception | None = None
    max_retries = int(settings.get('max_retries', 3))
    timeout_seconds = int(settings.get('timeout_seconds', 30))

    for attempt in range(1, max_retries + 1):
        try:
            with request.urlopen(req, timeout=timeout_seconds) as resp:
                raw = resp.read().decode('utf-8')
                data = json.loads(raw)
                if 'choices' not in data or not data['choices']:
                    raise ValueError('AI provider returned no choices')
                content = data['choices'][0]['message']['content']
                parsed = _parse_json_response(content)
                return parsed
        except (error.URLError, error.HTTPError, ValueError, json.JSONDecodeError, KeyError, TypeError) as exc:
            last_error = exc
            if attempt < max_retries:
                time.sleep(0.5 * attempt)
                continue

    raise RuntimeError(f'AI provider request failed after {max_retries} attempts: {last_error}') from last_error


def call_model(messages: List[Dict[str, str]], response_format: str = 'json_object') -> Dict[str, Any]:
    settings = provider_settings()
    provider = settings['provider']

    if provider == 'mock':
        return {
            'category': 'No water supply',
            'subcategory': 'Water outage',
            'department': 'Water Supply',
            'confidence': 0.92,
            'keywords': ['water', 'ward', 'no supply', 'three days'],
            'entities': ['water', 'ward 12', 'residential area'],
            'decision_factors': ['Service disruption in a residential area', 'Issue is ongoing across several days', 'Localized public utility failure'],
            'summary': 'Water supply is unavailable in a residential area for several days.',
            'key_points': ['Residents report no water for several days', 'Issue appears localized to one ward', 'Potential water utility service disruption'],
            'entities_summary': ['water', 'ward 12'],
            'urgency_indicators': ['water shortage', 'ongoing disruption'],
            'model': 'mock-model',
            'provider': 'mock',
            'source': 'mock',
            'timestamp': __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),
            'urgency': 72,
            'duration': 60,
            'affected_population': 58,
            'vulnerability': 35,
            'essential_service': 80,
            'infrastructure_importance': 65,
            'recurrence': 25,
            'factors': {
                'reason': 'No water supply has broad utility impact and may affect residents for multiple days',
                'service_type': 'water',
                'duration_signal': 'multiple-day outage',
            },
            'explanation': 'Mock provider used because no external provider is configured.',
            'department': 'Water Supply',
            'department_routing': 'Water Supply',
            'recommended_officer': 'Water Works Inspector',
            'ward_or_subdivision': 'Ward 12',
            'reason': 'Water outage and service-critical infrastructure',
            'candidates': [],
            'master_complaint_id': None,
        }

    if provider not in {'openai_compatible'}:
        raise RuntimeError(f'Unsupported AI provider: {provider}. Supported values: openai_compatible, mock')

    return _call_openai_compatible(messages, response_format)
