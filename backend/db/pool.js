// db/pool.js
// Single shared PostgreSQL connection pool, used by every controller.

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/janseva';

if (!connectionString) {
    console.error('Missing DATABASE_URL. Copy .env.example to .env and set DATABASE_URL=postgresql://janseva:janseva@localhost:5432/janseva');
}

const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

module.exports = pool;
