require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, pool } = require('./index');

async function runMigrations() {
  console.log('Running database migrations...');

  // Create migrations tracking table
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      ran_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, '../../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await query(
      'SELECT id FROM _migrations WHERE filename = $1',
      [file]
    );

    if (rows.length > 0) {
      console.log(`  ✓ Already ran: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await query(sql);
      await query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      console.log(`  ✅ Migrated: ${file}`);
    } catch (err) {
      console.error(`  ❌ Failed: ${file}`, err.message);
      process.exit(1);
    }
  }

  console.log('Migrations complete.');
  await pool.end();
}

runMigrations().catch(console.error);
