// services/aiEngine.js
//
// In-process rule-based "AI" for JanSeva. No external model, no network call —
// everything here is deterministic keyword/heuristic logic that runs
// synchronously right after a complaint is created. This is intentionally NOT
// a Python/FastAPI microservice: for a hackathon deadline, an in-process
// engine that actually runs beats a separate service that doesn't exist yet.
//
// Every function returns plain data; the caller (complaintController) is
// responsible for persisting it via the existing pipeline tables, so the
// output shape matches exactly what pipelineController's addPrediction /
// addSeverityScore / addRoutingResult / setSla already expect.

const pool = require('../db/pool');

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function detectLanguage(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    const hints = ['pani', 'bijli', 'sadak', 'kabaad', 'nahi', 'basti', 'ghat', 'jal', 'nadi'];
    return hints.some((hint) => text.includes(hint)) ? 'hi' : 'en';
}

function summarizeText(text, maxLength = 200) {
    const clean = normalizeText(text);
    if (clean.length <= maxLength) return clean;
    return `${clean.slice(0, maxLength - 3).trim()}...`;
}

// ---------------------------------------------------------------------------
// 1. CLASSIFICATION — predicted_category / predicted_department / confidence
// ---------------------------------------------------------------------------

// Keyword -> category name. Matched against categories already seeded in the
// DB (db/schema.sql), so predicted_category lines up with real category rows
// instead of inventing labels the rest of the system doesn't know about.
const CATEGORY_KEYWORDS = [
    { category: 'No water supply', keywords: ['water', 'pipeline', 'tap', 'supply cut', 'no water', 'leak'] },
    { category: 'Pothole', keywords: ['pothole', 'road', 'crack', 'street damage', 'asphalt'] },
    { category: 'Streetlight not working', keywords: ['streetlight', 'street light', 'lamp', 'light not working', 'dark street'] },
    { category: 'Garbage not collected', keywords: ['garbage', 'waste', 'trash', 'dump', 'sanitation', 'sewage'] },
];

function classifyComplaint(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    let best = null;
    let bestHits = 0;
    for (const entry of CATEGORY_KEYWORDS) {
        const hits = entry.keywords.filter((kw) => text.includes(kw)).length;
        if (hits > bestHits) {
            best = entry.category;
            bestHits = hits;
        }
    }

    // Confidence is deliberately conservative and explainable: more keyword
    // hits -> higher confidence, capped so it never claims false certainty.
    const confidence = best ? Math.min(60 + bestHits * 15, 95) : 30;
    const predicted_category = best || 'General Civic Issue';
    const ai_summary = summarizeText(description, 200);

    return { predicted_category, confidence, ai_summary, entities: extractEntities(`${title} ${description}`) };
}

function extractEntities(text) {
    const cleaned = normalizeText(text).toLowerCase();
    return cleaned
        .split(/\s+/)
        .filter((token) => token.length > 3)
        .filter((token, index, arr) => arr.indexOf(token) === index)
        .slice(0, 10);
}

// ---------------------------------------------------------------------------
// 2. SEVERITY — the six 0-100 component scores the existing formula expects
//    (0.25 urgency + 0.20 affected + 0.15 vulnerability + 0.15 infra +
//     0.15 duration + 0.10 recurrence, computed server-side in
//     pipelineController.computeSeverity)
// ---------------------------------------------------------------------------

const URGENCY_KEYWORDS = ['emergency', 'accident', 'danger', 'dangerous', 'unsafe', 'fire', 'collapse', 'urgent', 'overflow', 'electrocut'];
const VULNERABLE_KEYWORDS = ['child', 'children', 'school', 'elderly', 'senior', 'hospital', 'disab', 'infant'];
const INFRA_KEYWORDS = ['hospital', 'school', 'main road', 'highway', 'power station', 'water main', 'bridge', 'substation'];
const DURATION_KEYWORDS = { high: ['month', 'weeks', 'week'], medium: ['days', 'few days'] };
const AFFECTED_KEYWORDS = { high: ['entire', 'whole area', 'whole colony', 'entire street', 'many people', 'everyone'], medium: ['neighbours', 'neighbors', 'several houses', 'many houses'] };

function scoreFromKeywordHit(text, keywords, hitScore = 70, missScore = 20) {
    return keywords.some((kw) => text.includes(kw)) ? hitScore : missScore;
}

// recurrenceCount = number of prior complaints already in the same duplicate
// cluster (i.e. this is the Nth report of the same underlying issue) —
// computed by the caller from the duplicate-check step below.
function scoreSeverityInputs(title, description, recurrenceCount = 0) {
    const text = `${title} ${description}`.toLowerCase();

    const urgency_score = scoreFromKeywordHit(text, URGENCY_KEYWORDS, 85, 25);
    const vulnerability_score = scoreFromKeywordHit(text, VULNERABLE_KEYWORDS, 80, 15);
    const critical_infra_score = scoreFromKeywordHit(text, INFRA_KEYWORDS, 75, 10);

    let duration_score = 20;
    if (DURATION_KEYWORDS.high.some((kw) => text.includes(kw))) duration_score = 80;
    else if (DURATION_KEYWORDS.medium.some((kw) => text.includes(kw))) duration_score = 50;

    let affected_count_score = 20;
    if (AFFECTED_KEYWORDS.high.some((kw) => text.includes(kw))) affected_count_score = 85;
    else if (AFFECTED_KEYWORDS.medium.some((kw) => text.includes(kw))) affected_count_score = 55;

    // Recurrence: each additional report of the same issue raises this score,
    // capped at 100. First-ever report of an issue scores low.
    const recurrence_score = Math.min(20 + recurrenceCount * 25, 100);

    const explanation_json = {
        urgency: urgency_score >= 85 ? 'Language suggests an active safety risk' : 'No explicit danger/emergency language detected',
        vulnerability: vulnerability_score >= 80 ? 'Mentions a vulnerable group or location (children, elderly, hospital, school)' : 'No vulnerable-group indicators found',
        critical_infra: critical_infra_score >= 75 ? 'Involves critical infrastructure (hospital, school, main road, power/water trunk line)' : 'No critical-infrastructure keywords found',
        duration: duration_score >= 80 ? 'Reported as ongoing for weeks/months' : duration_score >= 50 ? 'Reported as ongoing for several days' : 'No duration signal, assumed recent',
        affected_count: affected_count_score >= 85 ? 'Language suggests a large area/many residents affected' : affected_count_score >= 55 ? 'Language suggests several households affected' : 'No scale signal, assumed localized',
        recurrence: recurrenceCount > 0 ? `Matches ${recurrenceCount} other open report(s) of the same issue` : 'No prior matching reports found',
    };

    return { urgency_score, affected_count_score, vulnerability_score, critical_infra_score, duration_score, recurrence_score, explanation_json };
}

// ---------------------------------------------------------------------------
// 3. DUPLICATE DETECTION — Jaccard word-overlap similarity against recent,
//    still-open complaints. No embeddings/ML needed for a same-day demo;
//    this catches the "20 complaints about the same pothole" case, which is
//    the actual pitch.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'of', 'and', 'for', 'this', 'that', 'it', 'near', 'our', 'my', 'has', 'been', 'with', 'there', 'from', 'into', 'over', 'under', 'after', 'before']);

const SEMANTIC_ROOTS = {
    water: ['water', 'pani', 'tap', 'pipes', 'pipeline', 'hydrant', 'supply', 'supply cut', 'drinking water', 'no water'],
    sewer: ['sewer', 'drain', 'drainage', 'clog', 'overflow', 'stagnant', 'wastewater', 'sewage'],
    garbage: ['garbage', 'trash', 'waste', 'dump', 'litter', 'sanitation', 'solid waste'],
    road: ['road', 'street', 'lane', 'pothole', 'asphalt', 'crack', 'damaged road', 'broken road'],
    light: ['streetlight', 'street light', 'lamp', 'bulb', 'lighting', 'dark', 'light', 'lights'],
    electricity: ['electricity', 'power', 'transformer', 'wire', 'wiring', 'voltage', 'outage', 'meter'],
    drainage: ['drainage', 'stormwater', 'waterlogging', 'flooding', 'flood', 'water log'],
};

function normalizeWord(word) {
    const cleaned = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!cleaned) return null;
    if (cleaned.endsWith('ies') && cleaned.length > 4) return cleaned.slice(0, -3) + 'y';
    if (cleaned.endsWith('es') && cleaned.length > 4) return cleaned.slice(0, -2);
    if (cleaned.endsWith('s') && cleaned.length > 4) return cleaned.slice(0, -1);
    return cleaned;
}

function deriveSemanticConcepts(text) {
    const normalized = normalizeText(text).toLowerCase();
    const concepts = new Map();

    Object.entries(SEMANTIC_ROOTS).forEach(([root, keywords]) => {
        const matches = keywords.filter((phrase) => normalized.includes(phrase));
        if (matches.length) {
            concepts.set(root, matches.length + 1);
        }
    });

    const words = normalized
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOPWORDS.has(word));

    for (const word of words) {
        const normalizedWord = normalizeWord(word);
        if (!normalizedWord) continue;
        let root = null;
        for (const [concept, terms] of Object.entries(SEMANTIC_ROOTS)) {
            if (terms.some((term) => term === normalizedWord || term.includes(normalizedWord))) {
                root = concept;
                break;
            }
        }
        if (!root) continue;
        concepts.set(root, (concepts.get(root) || 0) + 1);
    }

    return concepts;
}

function tokenize(text) {
    return new Set(
        text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    );
}

function jaccardSimilarity(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const token of setA) if (setB.has(token)) intersection++;
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
}

function weightedOverlapSimilarity(mapA, mapB) {
    const keys = new Set([...mapA.keys(), ...mapB.keys()]);
    if (keys.size === 0) return 0;

    let overlap = 0;
    let total = 0;
    for (const key of keys) {
        const a = mapA.get(key) || 0;
        const b = mapB.get(key) || 0;
        overlap += Math.min(a, b);
        total += Math.max(a, b);
    }
    return total === 0 ? 0 : overlap / total;
}

function semanticDuplicateSimilarity(textA, textB) {
    const conceptsA = deriveSemanticConcepts(textA);
    const conceptsB = deriveSemanticConcepts(textB);
    const lexicalA = tokenize(textA);
    const lexicalB = tokenize(textB);

    const lexicalScore = jaccardSimilarity(lexicalA, lexicalB);
    const conceptOverlap = weightedOverlapSimilarity(conceptsA, conceptsB);

    const sharedConcepts = [...conceptsA.keys()].filter((key) => conceptsB.has(key));
    const dominantSharedConcept = sharedConcepts.reduce((best, key) => {
        const score = (conceptsA.get(key) || 0) + (conceptsB.get(key) || 0);
        if (score > best.score) return { key, score };
        return best;
    }, { key: null, score: 0 });

    const sharedCoreTokens = [...lexicalA].filter((token) => lexicalB.has(token));
    const coreOverlap = sharedCoreTokens.length > 0 ? sharedCoreTokens.length / Math.max(lexicalA.size, lexicalB.size) : 0;

    const semanticCandidate = conceptOverlap * 0.6 + coreOverlap * 0.2 + lexicalScore * 0.2;
    const rootBoost = dominantSharedConcept.score > 0 ? 0.25 + Math.min(0.2, dominantSharedConcept.score * 0.08) : 0;

    if (dominantSharedConcept.score > 0) {
        return Math.min(1, Math.max(semanticCandidate + rootBoost, lexicalScore * 0.8));
    }

    // Fallback: keep the original heuristic, but cap it so unrelated civic issues
    // do not outrank a true duplicate in a different service category.
    return Math.min(0.32, Math.max(0, semanticCandidate * 0.8 + lexicalScore * 0.2));
}

const DUPLICATE_SIMILARITY_THRESHOLD = 0.45;
const DUPLICATE_LOOKBACK_DAYS = 30;

// Compares the new complaint against other recent, open complaints in the
// same department. Returns the best match (if any) above the threshold, plus
// how many other complaints are already in that match's cluster (used as the
// recurrence signal for severity scoring).
async function findDuplicate(newComplaint) {
    const { rows: candidates } = await pool.query(
        `SELECT id, title, description FROM complaints
         WHERE department_id = $1
           AND id != $2
           AND status NOT IN ('closed')
           AND created_at >= NOW() - INTERVAL '${DUPLICATE_LOOKBACK_DAYS} days'
         ORDER BY created_at DESC
         LIMIT 200`,
        [newComplaint.department_id, newComplaint.id]
    );

    const newText = `${newComplaint.title} ${newComplaint.description}`;
    let best = null;
    let bestScore = 0;

    for (const candidate of candidates) {
        const candidateText = `${candidate.title} ${candidate.description}`;
        const score = semanticDuplicateSimilarity(newText, candidateText);
        if (score > bestScore) {
            best = candidate;
            bestScore = score;
        }
    }

    if (!best || bestScore < DUPLICATE_SIMILARITY_THRESHOLD) {
        return { matched_complaint_id: null, similarity_score: 0, recurrenceCount: 0 };
    }

    // How many complaints are already in the matched complaint's cluster?
    // Used to inform the recurrence_score in severity scoring.
    const { rows: clusterRows } = await pool.query(
        `SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1`,
        [best.id]
    );
    let recurrenceCount = 1; // the matched complaint itself
    if (clusterRows.length) {
        const { rows: memberRows } = await pool.query(
            `SELECT COUNT(*)::int AS n FROM duplicate_cluster_members WHERE cluster_id = $1`,
            [clusterRows[0].cluster_id]
        );
        recurrenceCount = memberRows[0].n;
    }

    return { matched_complaint_id: best.id, similarity_score: Math.round(bestScore * 10000) / 10000, recurrenceCount };
}

function scoreSemanticDuplicate(textA, textB) {
    return semanticDuplicateSimilarity(textA, textB);
}

// ---------------------------------------------------------------------------
// 4. ROUTING — pick the least-loaded officer in the target department
// ---------------------------------------------------------------------------

async function pickOfficerForDepartment(department_id) {
    if (!department_id) return { officer_id: null, reason: 'No department resolved from category; unassigned pending manual triage.' };

    const { rows } = await pool.query(
        `SELECT o.id, COUNT(c.id) FILTER (WHERE c.status NOT IN ('resolved', 'closed')) AS open_count
         FROM officers o
         LEFT JOIN complaints c ON c.assigned_officer_id = o.id
         WHERE o.department_id = $1
         GROUP BY o.id
         ORDER BY open_count ASC
         LIMIT 1`,
        [department_id]
    );

    if (!rows.length) return { officer_id: null, reason: 'No officers registered in this department yet; unassigned pending manual triage.' };
    return { officer_id: rows[0].id, reason: `Auto-routed to least-loaded officer in department (${rows[0].open_count} open complaints).` };
}

async function resolveDepartmentByName(departmentName) {
    const name = String(departmentName || '').trim();
    if (!name) return null;

    const { rows } = await pool.query(
        `SELECT id, name FROM departments
         WHERE LOWER(name) = LOWER($1) OR LOWER(name) LIKE LOWER($2)
         LIMIT 1`,
        [name, `%${name}%`]
    );
    return rows[0] || null;
}

async function validateRoutingRecommendation(recommendation, complaintContext = {}) {
    const route = recommendation || {};
    const preferredDepartmentName = route.department_name || route.department || complaintContext.department_name || complaintContext.department || null;
    const fallbackDepartmentId = complaintContext.department_id || null;

    let department_id = fallbackDepartmentId;
    let department_name = null;
    if (preferredDepartmentName) {
        const departmentRow = await resolveDepartmentByName(preferredDepartmentName);
        if (departmentRow) {
           department_id = departmentRow.id;
           department_name = departmentRow.name;
        }
    }

    if (!department_id && fallbackDepartmentId) {
        const { rows } = await pool.query('SELECT id, name FROM departments WHERE id = $1', [fallbackDepartmentId]);
        if (rows.length) {
           department_id = rows[0].id;
           department_name = rows[0].name;
        }
    }

    if (!department_id) {
        return {
           department_id: null,
           department_name: null,
           officer_id: null,
           ward: route.ward || route.ward_or_subdivision || route.subdivision || complaintContext.ward || 'Unspecified',
           subdivision: route.subdivision || route.ward_or_subdivision || complaintContext.subdivision || null,
           confidence: 0,
           reason: 'No valid department could be validated for routing; manual assignment required.',
        };
    }

    const preferredOfficer = route.recommended_officer || route.recommendedOfficer || route.officer || route.officer_name || null;
    let officer_id = null;
    if (preferredOfficer) {
        const normalizedOfficerName = String(preferredOfficer).trim();
        const { rows } = await pool.query(
           `SELECT o.id, o.designation, u.name AS user_name
             FROM officers o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.department_id = $1
               AND (
                   LOWER(COALESCE(o.designation, '')) LIKE LOWER($2)
                   OR LOWER(COALESCE(u.name, '')) LIKE LOWER($2)
               )
             ORDER BY o.id
             LIMIT 1`,
           [department_id, `%${normalizedOfficerName}%`]
        );
        if (rows.length) officer_id = rows[0].id;
    }

    if (!officer_id) {
        const fallbackOfficer = await pickOfficerForDepartment(department_id);
        officer_id = fallbackOfficer.officer_id;
    }

    const rawConfidence = Number(route.confidence ?? route.score ?? 0.5);
    const confidence = Number.isFinite(rawConfidence) ? Math.min(1, Math.max(0, rawConfidence)) : 0.5;
    const ward = route.ward || route.ward_or_subdivision || route.subdivision || complaintContext.ward || 'Unspecified';
    const subdivision = route.subdivision || route.ward_or_subdivision || complaintContext.subdivision || null;
    const reason = route.reason || `Backend accepted ${department_name || 'the proposed department'} routing for ${ward} and validated the assigned officer before persistence.`;

    return {
        department_id,
        department_name,
        officer_id,
        ward,
        subdivision,
        confidence,
        reason,
    };
}

// ---------------------------------------------------------------------------
// 5. SLA — turn priority_label into a concrete deadline
// ---------------------------------------------------------------------------

const SLA_HOURS_BY_PRIORITY = { CRITICAL: 24, HIGH: 72, MEDIUM: 168, LOW: 336 }; // 1d / 3d / 7d / 14d

function calculateSlaDeadline(priority_label) {
    const hours = SLA_HOURS_BY_PRIORITY[priority_label] ?? SLA_HOURS_BY_PRIORITY.LOW;
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function computeSeverity({ urgency_score, affected_count_score, vulnerability_score, critical_infra_score, duration_score, recurrence_score }) {
    const weights = { urgency: 0.25, affected: 0.20, vulnerability: 0.15, infra: 0.15, duration: 0.15, recurrence: 0.10 };
    const final =
        weights.urgency * (urgency_score || 0) +
        weights.affected * (affected_count_score || 0) +
        weights.vulnerability * (vulnerability_score || 0) +
        weights.infra * (critical_infra_score || 0) +
        weights.duration * (duration_score || 0) +
        weights.recurrence * (recurrence_score || 0);
    return Math.round(final * 100) / 100;
}

function priorityFromScore(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 35) return 'MEDIUM';
    return 'LOW';
}

module.exports = {
    normalizeText,
    detectLanguage,
    summarizeText,
    classifyComplaint,
    scoreSeverityInputs,
    findDuplicate,
    scoreSemanticDuplicate,
    pickOfficerForDepartment,
    resolveDepartmentByName,
    validateRoutingRecommendation,
    calculateSlaDeadline,
    computeSeverity,
    priorityFromScore,
};
