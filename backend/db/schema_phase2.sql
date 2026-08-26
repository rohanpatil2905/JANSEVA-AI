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
    level                       VARCHAR(20) CHECK (level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    priority_label               VARCHAR(20) CHECK (priority_label IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    factors                     JSONB,
    explanation_json             JSONB,
    xai_explanation              TEXT,
    created_at                   TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE severity_scores
    ADD COLUMN IF NOT EXISTS level VARCHAR(20) CHECK (level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ADD COLUMN IF NOT EXISTS factors JSONB,
    ADD COLUMN IF NOT EXISTS xai_explanation TEXT,
    ADD COLUMN IF NOT EXISTS requires_review BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (review_status IN ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED', 'FLAGGED'));

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
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representative_complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
    category                    VARCHAR(100),
    location                    TEXT,
    severity                    VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status                      VARCHAR(30) NOT NULL DEFAULT 'open'
                                CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    affected_count              INTEGER NOT NULL DEFAULT 0,
    priority                    VARCHAR(20) NOT NULL DEFAULT 'LOW'
                                CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE duplicate_clusters
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    ADD COLUMN IF NOT EXISTS affected_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'LOW'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

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
    ward            VARCHAR(100),
    subdivision     VARCHAR(100),
    confidence      NUMERIC(4,3) CHECK (confidence >= 0 AND confidence <= 1),
    reason           TEXT,
    requires_review BOOLEAN NOT NULL DEFAULT FALSE,
    review_status   VARCHAR(20) NOT NULL DEFAULT 'PENDING'
         CHECK (review_status IN ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED', 'FLAGGED')),
    final_decision  TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE routing_results
    ADD COLUMN IF NOT EXISTS requires_review BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (review_status IN ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED', 'FLAGGED')),
    ADD COLUMN IF NOT EXISTS final_decision TEXT;

-- ============================================================
-- OFFICER_REVIEWS
-- Human-in-the-loop: officer approves/modifies/flags an AI recommendation.
-- ============================================================
CREATE TABLE IF NOT EXISTS officer_reviews (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id             UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    officer_id               UUID NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
    action                   VARCHAR(30) NOT NULL CHECK (action IN ('APPROVE', 'MODIFY', 'REJECT', 'FLAG_FOR_REVIEW')),
    original_ai_recommendation JSONB,
    final_decision           JSONB,
    modification_reason      TEXT,
    notes                    TEXT,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE officer_reviews
    ADD COLUMN IF NOT EXISTS original_ai_recommendation JSONB,
    ADD COLUMN IF NOT EXISTS final_decision JSONB,
    ADD COLUMN IF NOT EXISTS modification_reason TEXT,
    ADD COLUMN IF NOT EXISTS action VARCHAR(30) CHECK (action IN ('APPROVE', 'MODIFY', 'REJECT', 'FLAG_FOR_REVIEW'));

-- ============================================================
-- SLA_TRACKING
-- Deadline tracking + escalation for each complaint.
-- ============================================================
CREATE TABLE IF NOT EXISTS sla_tracking (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id        UUID UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    priority_label      VARCHAR(20) NOT NULL DEFAULT 'LOW'
        CHECK (priority_label IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status              VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'BREACHED', 'RESOLVED', 'CANCELLED')),
    deadline             TIMESTAMP NOT NULL,
    started_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMP,
    is_breached          BOOLEAN NOT NULL DEFAULT FALSE,
    escalated_at         TIMESTAMP,
    current_escalation_level VARCHAR(60) DEFAULT NULL,
    escalation_reason   TEXT,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE sla_tracking
    ADD COLUMN IF NOT EXISTS priority_label VARCHAR(20) NOT NULL DEFAULT 'LOW'
        CHECK (priority_label IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'BREACHED', 'RESOLVED', 'CANCELLED')),
    ADD COLUMN IF NOT EXISTS deadline TIMESTAMP,
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS is_breached BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS current_escalation_level VARCHAR(60) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS escalation_reason TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS sla_escalations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id        UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    escalation_level    VARCHAR(60) NOT NULL,
    reason              TEXT NOT NULL,
    escalated_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sla_escalations_complaint ON sla_escalations(complaint_id);

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
CREATE TABLE IF NOT EXISTS ai_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVIEW_REQUIRED')),
    provider VARCHAR(50),
    model VARCHAR(100),
    source VARCHAR(30) NOT NULL DEFAULT 'external',
    payload JSONB,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(complaint_id, job_type)
);

CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_complaint ON ai_processing_jobs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_status ON ai_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_complaint ON audit_logs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
