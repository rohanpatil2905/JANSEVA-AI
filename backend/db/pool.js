// db/pool.js
// Single shared PostgreSQL connection pool, used by every controller.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Example DATABASE_URL:
    // postgresql://username:password@localhost:5432/janseva
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

module.exports = pool;
