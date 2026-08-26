// db/pool.js
// Single shared PostgreSQL connection pool, used by every controller.

const { Pool } = require('pg');
require('dotenv').config();

const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/janseva';

const isRender =
    process.env.RENDER === 'true' ||
    connectionString.includes('render.com');

const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,

    // Render PostgreSQL requires SSL/TLS.
    // Local PostgreSQL continues to work without SSL.
    ssl: isRender
        ? {
            rejectUnauthorized: false,
        }
        : false,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

module.exports = pool;