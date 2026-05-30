require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, pool } = require('./index');

async function seed() {
  console.log('Seeding database...');
  const sql = fs.readFileSync(
    path.join(__dirname, '../../migrations/002_seed.sql'),
    'utf8'
  );
  await query(sql);
  console.log('Seed complete.');
  console.log('\nDemo accounts:');
  console.log('  Admin:      admin@codeforge.dev      / Admin1234!');
  console.log('  Instructor: instructor@codeforge.dev / Instructor1!');
  console.log('  Student:    student@codeforge.dev    / Student123!');
  await pool.end();
}

seed().catch(console.error);
