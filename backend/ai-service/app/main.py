from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .config import AI_SERVICE_KEY, provider_settings
from .providers import call_model

app = FastAPI(title='JanSeva AI Service', version='2.0.0')


class ComplaintInput(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=2)
    language: Optional[str] = 'en'
    category_id: Optional[str] = None
    department_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    media: List[Dict[str, Any]] = Field(default_factory=list)
    existing_complaints: List[Dict[str, Any]] = Field(default_factory=list)


class SeverityInput(BaseModel):
    title: str
    description: str
    recurrence_count: int = 0


def _require_service_key(x_ai_service_key: Optional[str]) -> None:
    if AI_SERVICE_KEY and x_ai_service_key != AI_SERVICE_KEY:
        raise HTTPException(status_code=403, detail='Invalid AI service key')


def normalize_text(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip()


def _ensure_dict(value: Any, key_name: str) -> Dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f'{key_name} must be a JSON object')
    return value


def _validate_classification(result: Dict[str, Any]) -> Dict[str, Any]:
    required = {'category', 'subcategory', 'department', 'confidence', 'keywords', 'entities', 'decision_factors'}
    missing = sorted(required - set(result.keys()))
    if missing:
        raise ValueError(f'Classification response missing keys: {missing}')
    score = float(result.get('confidence', 0))
    if not 0 <= score <= 1:
        raise ValueError('Classification confidence must be between 0 and 1')
    result['confidence'] = round(score, 4)
    return result


def _validate_summary(result: Dict[str, Any]) -> Dict[str, Any]:
    required = {'summary', 'key_points', 'entities', 'urgency_indicators', 'model', 'provider', 'timestamp'}
    missing = sorted(required - set(result.keys()))
    if missing:
        raise ValueError(f'Summary response missing keys: {missing}')
    result['provider'] = result.get('provider', provider_settings()['provider'])
    result['model'] = result.get('model', provider_settings()['model'])
    result['timestamp'] = result.get('timestamp') or datetime.now(timezone.utc).isoformat()
    return result


def _determine_severity_level(score: float) -> str:
    if score >= 80:
        return 'CRITICAL'
    if score >= 60:
        return 'HIGH'
    if score >= 35:
        return 'MEDIUM'
    return 'LOW'


def _validate_severity(result: Dict[str, Any]) -> Dict[str, Any]:
    required = {'urgency', 'duration', 'affected_population', 'vulnerability', 'essential_service', 'infrastructure_importance', 'recurrence', 'factors'}
    missing = sorted(required - set(result.keys()))
    if missing:
        raise ValueError(f'Severity response missing keys: {missing}')
    factor_values = [float(result.get(key, 0) or 0) for key in ['urgency', 'duration', 'affected_population', 'vulnerability', 'essential_service', 'infrastructure_importance', 'recurrence']]
    score = round(sum(factor_values) / len(factor_values), 2)
    result['score'] = score
    result['level'] = _determine_severity_level(score)
    result['explanation'] = result.get('explanation') or 'Severity derived from urgency, duration, affected population, vulnerability, essential service criticality, infrastructure importance, and recurrence.'
    result['factors'] = _ensure_dict(result.get('factors', {}), 'severity factors')
    return result


def _validate_routing(result: Dict[str, Any]) -> Dict[str, Any]:
    required = {'department', 'ward_or_subdivision', 'recommended_officer', 'confidence', 'reason'}
    missing = sorted(required - set(result.keys()))
    if missing:
        raise ValueError(f'Routing response missing keys: {missing}')
    confidence = float(result.get('confidence', 0) or 0)
    result['confidence'] = round(min(max(confidence, 0), 1), 4)
    return result


def _build_classification_prompt(title: str, description: str) -> List[Dict[str, str]]:
    return [{
        'role': 'system',
        'content': (
            'You are a public grievance classification expert for civic service complaints. '
            'Classify the complaint into a category, subcategory, and department, and identify the likely keywords/entities. '
            'Return valid JSON only with keys: category, subcategory, department, confidence, keywords, entities, decision_factors. '
            'confidence must be a number between 0 and 1. keywords and entities must be arrays of strings. decision_factors must be concise, fact-based reasons such as public service impact, duration, locality, and infrastructure criticality.'
        )
    }, {
        'role': 'user',
        'content': f'Title: {title}\nDescription: {description}'
    }]


def _build_summary_prompt(title: str, description: str) -> List[Dict[str, str]]:
    return [{
        'role': 'system',
        'content': (
            'You are a concise officer-facing assistant for a municipal grievance workflow. Summarize the complaint without modifying the citizen story. '
            'Return valid JSON only with keys: summary, key_points, entities, urgency_indicators, model, provider, timestamp. '
            'summary is a short factual sentence, key_points is an array of 3-5 strings, entities is an array of strings, urgency_indicators is an array of strings, and model/provider/timestamp should be filled with metadata.'
        )
    }, {
        'role': 'user',
        'content': f'Title: {title}\nDescription: {description}'
    }]


def _build_severity_prompt(title: str, description: str, recurrence_count: int) -> List[Dict[str, str]]:
    return [{
        'role': 'system',
        'content': (
            'You are a public grievance severity assistant. Extract objective factors that explain severity but do not set the final severity alone. '
            'Return valid JSON only with keys: urgency, duration, affected_population, vulnerability, essential_service, infrastructure_importance, recurrence, factors, explanation. '
            'Each numeric field must be between 0 and 100. factors should summarize why the complaint matters. The backend will compute the final score and level from these factors.'
        )
    }, {
        'role': 'user',
        'content': f'Title: {title}\nDescription: {description}\nRecurrence count: {recurrence_count}'
    }]


def _build_duplicate_prompt(title: str, description: str, previous: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    return [{
        'role': 'system',
        'content': (
            'You are a duplicate detection expert. Compare this complaint against prior complaints and identify likely duplicate or related issues using factual similarities. '
            'Return valid JSON only with keys: candidates, master_complaint_id, explanation. candidates is an array of objects with complaint_id, similarity_score, reason. '
            'The backend is responsible for handling the cluster and preserving individual complaints.'
        )
    }, {
        'role': 'user',
        'content': f'Current complaint: {title} | {description}\nPrevious complaints: {json.dumps(previous[:10], ensure_ascii=False)}'
    }]


def _build_routing_prompt(title: str, description: str, location: Optional[Dict[str, Any]]) -> List[Dict[str, str]]:
    return [{
        'role': 'system',
        'content': (
            'You are a complaint routing assistant. Recommend the most suitable department, subdivision, ward, and officer role for this complaint based on category and location. '
            'Return valid JSON only with keys: department, ward_or_subdivision, recommended_officer, confidence, reason. '
            'The backend will validate authorization and jurisdiction before assignment.'
        )
    }, {
        'role': 'user',
        'content': f'Title: {title}\nDescription: {description}\nLocation: {json.dumps(location or {}, ensure_ascii=False)}'
    }]


@app.get('/health')
def health() -> Dict[str, Any]:
    settings = provider_settings()
    is_real_provider = settings.get('provider') == 'openai_compatible' and bool(settings.get('api_key'))
    return {
        'status': 'ok',
        'service': 'janseva-ai',
        'provider': settings['provider'],
        'model': settings['model'],
        'configured': bool(settings['api_key']) or settings['provider'] == 'mock',
        'real_provider_configured': is_real_provider,
        'fallback_mode': not is_real_provider,
        'provider_mode': 'REAL_AI' if is_real_provider else 'FALLBACK',
    }


@app.post('/classify')
def classify(payload: ComplaintInput, x_ai_service_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    _require_service_key(x_ai_service_key)
    try:
        result = _validate_classification(call_model(_build_classification_prompt(payload.title, payload.description)))
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=f'Classification validation failed: {exc}') from exc
    return {'status': 'ok', 'result': result, 'provider': provider_settings()['provider'], 'model': provider_settings()['model']}


@app.post('/summary')
def summary(payload: ComplaintInput, x_ai_service_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    _require_service_key(x_ai_service_key)
    try:
        result = _validate_summary(call_model(_build_summary_prompt(payload.title, payload.description)))
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=f'Summary validation failed: {exc}') from exc
    return {'status': 'ok', 'result': result, 'provider': provider_settings()['provider'], 'model': provider_settings()['model']}


@app.post('/severity')
def severity(payload: SeverityInput, x_ai_service_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    _require_service_key(x_ai_service_key)
    try:
        result = _validate_severity(call_model(_build_severity_prompt(payload.title, payload.description, payload.recurrence_count)))
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=f'Severity validation failed: {exc}') from exc
    return {'status': 'ok', 'result': result, 'provider': provider_settings()['provider'], 'model': provider_settings()['model']}


@app.post('/duplicates')
def duplicates(payload: dict, x_ai_service_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    _require_service_key(x_ai_service_key)
    title = str(payload.get('title', ''))
    description = str(payload.get('description', ''))
    previous = payload.get('previous_complaints', [])
    try:
        result = call_model(_build_duplicate_prompt(title, description, previous))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Duplicate detection failed: {exc}') from exc
    return {'status': 'ok', 'result': result, 'provider': provider_settings()['provider'], 'model': provider_settings()['model']}


@app.post('/route')
def route(payload: ComplaintInput, x_ai_service_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    _require_service_key(x_ai_service_key)
    location = {'latitude': payload.latitude, 'longitude': payload.longitude}
    try:
        result = _validate_routing(call_model(_build_routing_prompt(payload.title, payload.description, location)))
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=f'Routing validation failed: {exc}') from exc
    return {'status': 'ok', 'result': result, 'provider': provider_settings()['provider'], 'model': provider_settings()['model']}


@app.post('/analyze')
def analyze(payload: ComplaintInput, x_ai_service_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    _require_service_key(x_ai_service_key)
    classification = _validate_classification(call_model(_build_classification_prompt(payload.title, payload.description)))
    summary = _validate_summary(call_model(_build_summary_prompt(payload.title, payload.description)))
    severity = _validate_severity(call_model(_build_severity_prompt(payload.title, payload.description, 0)))
    routing = _validate_routing(call_model(_build_routing_prompt(payload.title, payload.description, {'latitude': payload.latitude, 'longitude': payload.longitude})))
    duplicates = call_model(_build_duplicate_prompt(payload.title, payload.description, payload.existing_complaints))

    return {
        'status': 'ok',
        'classification': classification,
        'summary': summary,
        'severity': severity,
        'routing': routing,
        'duplicates': duplicates,
        'provider': provider_settings()['provider'],
        'model': provider_settings()['model'],
        'requires_human_verification': True,
    }
