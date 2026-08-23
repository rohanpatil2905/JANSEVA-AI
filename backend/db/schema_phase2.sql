-- JanSeva AI — Phase 2 Database Migration
-- Adds AI pipeline, authenticity, duplicate detection, SLA, and audit trail tables.
-- Run this AFTER schema.sql. It only adds new tables — nothing in Phase 1 is touched.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- AI_PREDICTIONS
-- One row per AI pipeline run on a complaint: classification, summary, confidence.
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_predictions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id        UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    predicted_category  VARCHAR(100),
    predicted_department VARCHAR(100),
    confidence          NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
    ai_summary          TEXT,
    model_version        VARCHAR(50),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEVERITY_SCORES
-- Stores the multi-factor severity breakdown for a complaint (XAI-ready).
-- ============================================================
CREATE TABLE IF NOT EXISTS severity_scores (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id                UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    urgency_score                NUMERIC(5,2),
    affected_count_score         NUMERIC(5,2),
    vulnerability_score          NUMERIC(5,2),
    critical_infra_score         NUMERIC(5,2),
    duration_score                NUMERIC(5,2),
    recurrence_score              NUMERIC(5,2),
    final_score                  NUMERIC(5,2) CHECK (final_score >= 0 AND final_score <= 100),
    priority_label                VARCHAR(20) CHECK (priority_label IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    explanation_json              JSONB,  -- structured XAI breakdown, e.g. contribution % per factor
    created_at                    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTHENTICITY_RESULTS
-- Anti-abuse / spam / authenticity check for each complaint.
-- ============================================================
CREATE TABLE IF NOT EXISTS authenticity_results (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id            UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    account_trust_score     NUMERIC(5,2),
    content_validity_score  NUMERIC(5,2),
    location_consistency_score NUMERIC(5,2),
    evidence_consistency_score NUMERIC(5,2),
    spam_probability        NUMERIC(5,4) CHECK (spam_probability >= 0 AND spam_probability <= 1),
    authenticity_score      NUMERIC(5,2) CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
    result_label             VARCHAR(20) CHECK (result_label IN ('GENUINE', 'NEEDS_REVIEW', 'SUSPICIOUS')),
    created_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DUPLICATE_CLUSTERS
-- Groups complaints that the AI believes describe the same underlying issue.
-- ============================================================
CREATE TABLE IF NOT EXISTS duplicate_clusters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representative_complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS duplicate_cluster_members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id          UUID NOT NULL REFERENCES duplicate_clusters(id) ON DELETE CASCADE,
    complaint_id        UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    similarity_score    NUMERIC(5,4),
    UNIQUE(cluster_id, complaint_id)
);

-- ============================================================
-- ROUTING_RESULTS
-- Records why a complaint was routed to a given department/officer (XAI trail).
-- ============================================================
CREATE TABLE IF NOT EXISTS routing_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    routed_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    routed_officer_id    UUID REFERENCES officers(id) ON DELETE SET NULL,
    reason           TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OFFICER_REVIEWS
-- Human-in-the-loop: officer approves/modifies/flags an AI recommendation.
-- ============================================================
CREATE TABLE IF NOT EXISTS officer_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    officer_id      UUID NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
    action          VARCHAR(20) NOT NULL CHECK (action IN ('APPROVE_AI', 'MODIFY_AI', 'FLAG_FOR_REVIEW')),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SLA_TRACKING
-- Deadline tracking + escalation for each complaint.
-- ============================================================
CREATE TABLE IF NOT EXISTS sla_tracking (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id        UUID UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    deadline             TIMESTAMP NOT NULL,
    is_breached          BOOLEAN NOT NULL DEFAULT FALSE,
    escalated_at         TIMESTAMP,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT_LOGS
-- Append-only trail of every significant event on a complaint (accountability).
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    actor_id         UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if system/AI action
    action          VARCHAR(100) NOT NULL,   -- e.g. 'SUBMITTED', 'AI_CLASSIFIED', 'OFFICER_ACCEPTED', 'RESOLVED'
    details          JSONB,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ai_predictions_complaint ON ai_predictions(complaint_id);
CREATE INDEX IF NOT EXISTS idx_severity_scores_complaint ON severity_scores(complaint_id);
CREATE INDEX IF NOT EXISTS idx_authenticity_results_complaint ON authenticity_results(complaint_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_members_complaint ON duplicate_cluster_members(complaint_id);
CREATE INDEX IF NOT EXISTS idx_routing_results_complaint ON routing_results(complaint_id);
CREATE INDEX IF NOT EXISTS idx_officer_reviews_complaint ON officer_reviews(complaint_id);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_deadline ON sla_tracking(deadline);
CREATE INDEX IF NOT EXISTS idx_audit_logs_complaint ON audit_logs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
