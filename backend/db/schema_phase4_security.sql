-- JanSeva AI — Phase 4 security/data-integrity migration
-- Run after schema.sql and schema_phase2.sql.

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(30);

-- Backfill legacy rows before enforcing uniqueness.
UPDATE complaints
SET tracking_code = 'JAN-' || EXTRACT(YEAR FROM created_at)::INT || '-' || UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 6))
WHERE tracking_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_complaints_tracking_code ON complaints(tracking_code);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_officer ON complaints(assigned_officer_id);

-- A complaint can belong to at most one duplicate cluster.
CREATE UNIQUE INDEX IF NOT EXISTS idx_duplicate_one_cluster_per_complaint
ON duplicate_cluster_members(complaint_id);

-- Prevent impossible similarity values at the database layer where supported.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'duplicate_similarity_range'
    ) THEN
        ALTER TABLE duplicate_cluster_members
        ADD CONSTRAINT duplicate_similarity_range CHECK (similarity_score IS NULL OR (similarity_score >= 0 AND similarity_score <= 1));
    END IF;
END $$;
