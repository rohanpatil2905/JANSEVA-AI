const pool = require('./db/pool');

async function check() {
    try {
        const result = await pool.query(`
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_name IN (
                'complaints',
                'severity_scores',
                'sla_tracking',
                'routing_results',
                'ai_predictions',
                'duplicate_clusters'
            )
            ORDER BY table_name, ordinal_position
        `);

        console.table(result.rows);
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

check();