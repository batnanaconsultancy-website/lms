const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') console.log('✅ DB connected');
});

pool.on('error', (err) => {
  console.error('DB pool error:', err.message);
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
