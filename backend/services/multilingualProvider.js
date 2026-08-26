const DEFAULT_TARGET_LANGUAGE = 'en';

function hasRealTranslationConfig() {
    return Boolean(process.env.AI_SERVICE_URL && process.env.AI_SERVICE_API_KEY);
}

function detectLanguage(text) {
    const raw = String(text || '').toLowerCase();
    if (!raw.trim()) return 'en';

    const hiHints = ['pani', 'bijli', 'sadak', 'nahi', 'basti', 'nagar', 'ward', 'ghat', 'jal', 'nahin', 'se', 'mein', 'do', 'teen', 'ka', 'hai', 'nahi'];
    const matches = hiHints.filter((hint) => raw.includes(hint));
    return matches.length >= 1 ? 'hi' : 'en';
}

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

async function transcribeAudio({ audio_url, transcript, description, text }) {
    const sourceText = normalizeText(transcript || description || text || '');
    if (!sourceText && !audio_url) {
        return {
            transcript: '',
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
            warning: 'No transcript or audio provided; no speech-to-text was performed.',
        };
    }

    if (!hasRealTranslationConfig()) {
        return {
            transcript: sourceText || 'Audio processed with local fallback. Please provide a transcript when external speech providers are unavailable.',
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
            language: detectLanguage(sourceText || transcript || description || text || ''),
        };
    }

    try {
        const response = await fetch(`${process.env.AI_SERVICE_URL.replace(/\/$/, '')}/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-ai-service-key': process.env.AI_SERVICE_API_KEY,
            },
            body: JSON.stringify({ audio_url: audio_url || null, transcript: sourceText || null }),
        });

        if (!response.ok) {
            throw new Error(`Speech-to-text provider returned ${response.status}`);
        }

        const data = await response.json();
        return {
            transcript: data.transcript || sourceText,
            provider_status: 'REAL_AI',
            provider: data.provider || 'ai-service',
            language: data.language || detectLanguage(data.transcript || sourceText),
        };
    } catch (err) {
        return {
            transcript: sourceText || 'Speech-to-text provider unavailable; transcript fallback used.',
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
            language: detectLanguage(sourceText),
            warning: err.message,
        };
    }
}

async function translateText(text, sourceLanguage = 'auto', targetLanguage = DEFAULT_TARGET_LANGUAGE) {
    const normalized = normalizeText(text);
    const detectedSource = sourceLanguage === 'auto' ? detectLanguage(normalized) : (sourceLanguage || 'en');
    const safeTarget = targetLanguage || DEFAULT_TARGET_LANGUAGE;

    if (!normalized) {
        return {
            translated_text: '',
            source_language: detectedSource,
            target_language: safeTarget,
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
        };
    }

    if (!hasRealTranslationConfig()) {
        return {
            translated_text: normalized,
            source_language: detectedSource,
            target_language: safeTarget,
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
            note: 'No external translation provider configured; the original text is kept as the processing language fallback.',
        };
    }

    try {
        const response = await fetch(`${process.env.AI_SERVICE_URL.replace(/\/$/, '')}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-ai-service-key': process.env.AI_SERVICE_API_KEY,
            },
            body: JSON.stringify({ text: normalized, source_language: detectedSource, target_language: safeTarget }),
        });

        if (!response.ok) {
            throw new Error(`Translation provider returned ${response.status}`);
        }

        const data = await response.json();
        return {
            translated_text: data.translated_text || normalized,
            source_language: data.source_language || detectedSource,
            target_language: data.target_language || safeTarget,
            provider_status: 'REAL_AI',
            provider: data.provider || 'ai-service',
        };
    } catch (err) {
        return {
            translated_text: normalized,
            source_language: detectedSource,
            target_language: safeTarget,
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
            note: err.message,
        };
    }
}

async function translateOfficerResponse(note, targetLanguage) {
    const normalized = normalizeText(note || '');
    const safeTarget = targetLanguage || DEFAULT_TARGET_LANGUAGE;

    if (!normalized) {
        return {
            translated_note: '',
            target_language: safeTarget,
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
        };
    }

    if (!hasRealTranslationConfig()) {
        return {
            translated_note: normalized,
            target_language: safeTarget,
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
            note: 'No external translation provider configured; response remains in the officer language.',
        };
    }

    try {
        const response = await fetch(`${process.env.AI_SERVICE_URL.replace(/\/$/, '')}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-ai-service-key': process.env.AI_SERVICE_API_KEY,
            },
            body: JSON.stringify({ text: normalized, source_language: 'en', target_language: safeTarget }),
        });

        if (!response.ok) {
            throw new Error(`Translation provider returned ${response.status}`);
        }

        const data = await response.json();
        return {
            translated_note: data.translated_text || normalized,
            target_language: data.target_language || safeTarget,
            provider_status: 'REAL_AI',
            provider: data.provider || 'ai-service',
        };
    } catch (err) {
        return {
            translated_note: normalized,
            target_language: safeTarget,
            provider_status: 'FALLBACK',
            provider: 'local-fallback',
            note: err.message,
        };
    }
}

module.exports = {
    detectLanguage,
    normalizeText,
    transcribeAudio,
    translateText,
    translateOfficerResponse,
    hasRealTranslationConfig,
};
