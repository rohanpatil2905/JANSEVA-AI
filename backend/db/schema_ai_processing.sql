-- JanSeva AI — processing job tracking
-- Keeps complaint AI jobs visible to the backend even when work is asynchronous.

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

CREATE INDEX IF NOT EXISTS idx_ai_jobs_complaint ON ai_processing_jobs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_processing_jobs(status);
