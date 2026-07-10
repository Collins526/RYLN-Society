import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";

const envPath = path.resolve("./.env");
if (!fs.existsSync(envPath)) {
  throw new Error(`Missing env file at ${envPath}`);
}

const envFile = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envFile
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(/=/, 2)),
);
Object.assign(process.env, env);

console.log("DATABASE_URL present", !!process.env.DATABASE_URL);
console.log("PORT", process.env.PORT);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  const r = await pool.query("SELECT 1 as ok");
  console.log("SELECT 1", r.rows);
  const g = await pool.query("SELECT tablename FROM pg_tables WHERE tablename='gallery'");
  console.log("TABLE gallery", g.rows);
  const t = await pool.query("SELECT COUNT(*)::int as c FROM gallery");
  console.log("GALLERY COUNT", t.rows);
} catch (err) {
  console.error("ERR", err);
} finally {
  await pool.end();
}
