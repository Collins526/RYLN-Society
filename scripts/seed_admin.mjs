import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../artifacts/api-server/.env');
const envText = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([^=]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const connectionString = env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in', envPath);
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const passwordHash = '$2b$10$m6QZ7.7B.9QXpvQKosWNi.58PZ.M1JDn4YpbuISX3VftvMON6/xRO';

async function seed() {
  try {
    const result = await pool.query(
      `INSERT INTO members (full_name, email, phone, national_id, gender, date_of_birth, occupation, address, password_hash, role, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         status = EXCLUDED.status
       RETURNING id`,
      [
        'Admin User',
        'admin@ryln.org',
        '0000000000',
        '000000000',
        'other',
        '2000-01-01',
        'Admin',
        'Headquarters',
        passwordHash,
        'admin',
        'active',
      ],
    );
    console.log('seeded member id:', result.rows[0].id);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
