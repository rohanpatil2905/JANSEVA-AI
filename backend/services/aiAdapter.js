// services/aiAdapter.js
// Thin adapter between the Node backend and the optional Python AI service.
// If the external service is configured and healthy, we use it. Otherwise we
// gracefully fall back to the in-process rule-based engine so complaint intake
// still works even when AI is unavailable.

const aiEngine = require('./aiEngine');

function isAiServiceConfigured() {
    return Boolean(process.env.AI_SERVICE_URL && process.env.AI_SERVICE_API_KEY);
}

function localAnalysis(complaint) {
    const classification = aiEngine.classifyComplaint(complaint.title, complaint.description);
    const severityInputs = aiEngine.scoreSeverityInputs(complaint.title, complaint.description, 0);
    const recurrenceCount = 0;
    const final_score = aiEngine.computeSeverity ? aiEngine.computeSeverity(severityInputs) : undefined;
    const priority = aiEngine.priorityFromScore ? aiEngine.priorityFromScore(final_score ?? 0) : 'LOW';

    return {
        language: aiEngine.detectLanguage ? aiEngine.detectLanguage(complaint.title, complaint.description) : 'en',
        normalized_text: aiEngine.normalizeText ? aiEngine.normalizeText(`${complaint.title} ${complaint.description}`) : `${complaint.title} ${complaint.description}`.trim(),
        summary: aiEngine.summarizeText ? aiEngine.summarizeText(`${complaint.title} ${complaint.description}`) : `${complaint.title} ${complaint.description}`.slice(0, 200),
        classification: {
            category: classification.predicted_category,
            department: classification.predicted_department || null,
            confidence: classification.confidence,
            entities: classification.entities || []
        },
        severity: {
            score: final_score ?? 0,
            level: priority,
            factors: severityInputs,
            reasons: [
                'Derived from complaint urgency, impact, duration, and recurrence signals',
                'This is a fallback heuristic result because the external AI service is unavailable.'
            ]
        },
        duplicates: [],
        routing: {
            department_name: null,
            reason: 'Fallback routing: manual review required until the AI service confirms routing.'
        },
        requires_human_verification: true,
        service_mode: 'local-fallback',
        duplication_cluster_status: 'not_evaluated',
        sla: {
            priority: priority,
            deadline_hours: 24
        }
    };
}

async function analyzeComplaintWithFallback(complaint, existingComplaints = []) {
    if (!isAiServiceConfigured()) {
        return localAnalysis(complaint);
    }

    const url = `${process.env.AI_SERVICE_URL.replace(/\/$/, '')}/analyze`;
    const payload = {
        title: complaint.title,
        description: complaint.description,
        language: complaint.language || 'en',
        category_id: complaint.category_id || null,
        department_id: complaint.department_id || null,
        latitude: complaint.latitude || null,
        longitude: complaint.longitude || null,
        media: complaint.media || [],
        existing_complaints: existingComplaints.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            department_id: c.department_id || null,
        })),
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-ai-service-key': process.env.AI_SERVICE_API_KEY,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI service returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data && data.status === 'ok') {
            return data;
        }

        throw new Error('AI service returned an unexpected payload');
    } catch (err) {
        console.warn('AI service call failed, using local rule-based fallback:', err.message);
        return localAnalysis(complaint);
    }
}

module.exports = { analyzeComplaintWithFallback, localAnalysis, isAiServiceConfigured };
