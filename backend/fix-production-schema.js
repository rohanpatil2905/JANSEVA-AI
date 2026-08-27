const pool = require('./db/pool');

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('Starting JanSeva database schema migration...');

        await client.query('BEGIN');

        // ============================================================
        // COMPLAINTS - multilingual fields
        // ============================================================

        await client.query(`
            ALTER TABLE complaints
                ADD COLUMN IF NOT EXISTS language VARCHAR(20),
                ADD COLUMN IF NOT EXISTS original_language VARCHAR(20),
                ADD COLUMN IF NOT EXISTS original_text TEXT,
                ADD COLUMN IF NOT EXISTS transcript_text TEXT,
                ADD COLUMN IF NOT EXISTS translated_text TEXT,
                ADD COLUMN IF NOT EXISTS audio_reference TEXT,
                ADD COLUMN IF NOT EXISTS citizen_language VARCHAR(20),
                ADD COLUMN IF NOT EXISTS response_translation TEXT;
        `);

        console.log('✓ complaints columns updated');

        // ============================================================
        // DUPLICATE CLUSTERS
        // ============================================================

        await client.query(`
            ALTER TABLE duplicate_clusters
                ADD COLUMN IF NOT EXISTS priority VARCHAR(20);
        `);

        console.log('✓ duplicate_clusters updated');

        // ============================================================
        // ROUTING RESULTS
        // ============================================================

        await client.query(`
            ALTER TABLE routing_results
                ADD COLUMN IF NOT EXISTS ward VARCHAR(100),
                ADD COLUMN IF NOT EXISTS subdivision VARCHAR(100),
                ADD COLUMN IF NOT EXISTS confidence NUMERIC;
        `);

        console.log('✓ routing_results updated');

        // ============================================================
        // SLA TRACKING
        // ============================================================

        await client.query(`
            ALTER TABLE sla_tracking
                ADD COLUMN IF NOT EXISTS priority_label VARCHAR(20),
                ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE',
                ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS current_escalation_level VARCHAR(100),
                ADD COLUMN IF NOT EXISTS escalation_reason TEXT;
        `);

        console.log('✓ sla_tracking updated');

        // ============================================================
        // DEFAULT EXISTING SLA ROWS
        // ============================================================

        await client.query(`
            UPDATE sla_tracking
            SET status = COALESCE(status, 'ACTIVE')
            WHERE status IS NULL;
        `);

        await client.query(`
            UPDATE sla_tracking
            SET priority_label = COALESCE(priority_label, 'LOW')
            WHERE priority_label IS NULL;
        `);

        // ============================================================
        // AI PROCESSING JOBS
        // Create table if it doesn't exist
        // ============================================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_processing_jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
                job_type VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'PENDING',
                source VARCHAR(100),
                provider VARCHAR(100),
                model VARCHAR(100),
                payload JSONB,
                result JSONB,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✓ ai_processing_jobs table exists');

        // ============================================================
        // AI PROCESSING JOBS - missing columns
        // ============================================================

        await client.query(`
            ALTER TABLE ai_processing_jobs
                ADD COLUMN IF NOT EXISTS source VARCHAR(100),
                ADD COLUMN IF NOT EXISTS provider VARCHAR(100),
                ADD COLUMN IF NOT EXISTS model VARCHAR(100),
                ADD COLUMN IF NOT EXISTS payload JSONB,
                ADD COLUMN IF NOT EXISTS result JSONB,
                ADD COLUMN IF NOT EXISTS error_message TEXT,
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);

        // ============================================================
        // Required unique constraint for complaint triage jobs
        // ============================================================

        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_ai_processing_jobs_complaint_type
            ON ai_processing_jobs (complaint_id, job_type);
        `);

        console.log('✓ ai_processing_jobs updated');

        // ============================================================
        // DUPLICATE CLUSTER MEMBERS
        // Make sure the table used by SLA queries exists
        // ============================================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS duplicate_cluster_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                cluster_id UUID NOT NULL REFERENCES duplicate_clusters(id) ON DELETE CASCADE,
                complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE (cluster_id, complaint_id)
            );
        `);

        console.log('✓ duplicate_cluster_members verified');

        // ============================================================
        // SLA ESCALATIONS
        // Make sure the escalation table exists
        // ============================================================

        await client.query(`
            CREATE TABLE IF NOT EXISTS sla_escalations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
                escalation_level VARCHAR(100) NOT NULL,
                reason TEXT,
                escalated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✓ sla_escalations verified');

        // ============================================================
        // COMMIT
        // ============================================================

        await client.query('COMMIT');

        console.log('');
        console.log('==========================================');
        console.log('DATABASE MIGRATION SUCCESSFUL');
        console.log('==========================================');

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('');
        console.error('==========================================');
        console.error('DATABASE MIGRATION FAILED');
        console.error('==========================================');
        console.error(error);

        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();