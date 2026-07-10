import fs from "fs";
import path from "path";
import pg from "pg";

const envPath = path.resolve("artifacts", "api-server", ".env");
console.log("envPath", envPath);
const envFile = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envFile
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(/=/, 2)),
);
Object.assign(process.env, env);

console.log("DATABASE_URL", process.env.DATABASE_URL?.slice(0, 80));
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
