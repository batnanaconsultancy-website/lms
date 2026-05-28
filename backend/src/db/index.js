const { Pool } = require('pg');
require('dotenv').config();

// Neon PostgreSQL — uses standard pg driver with SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

/**
 * Execute a parameterised SQL query.
 * Usage: const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('DB query', { text: text.slice(0, 80), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Get a client for transactions.
 * Always release the client in a finally block.
 */
async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
