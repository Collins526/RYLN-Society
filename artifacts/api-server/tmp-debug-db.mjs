import "dotenv/config";
import pg from "pg";
const { Pool } = pg;
console.log("DATABASE_URL", process.env.DATABASE_URL ? "present" : "missing");
const conn = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  const r = await conn.query("SELECT 1 as ok");
  console.log("SELECT 1", r.rows);
  const g = await conn.query("SELECT tablename FROM pg_tables WHERE tablename='gallery'");
  console.log("TABLES", g.rows);
  const t = await conn.query("SELECT count(*) as c FROM gallery");
  console.log("GALLERYCOUNT", t.rows);
} catch (err) {
  console.error("ERR", err);
} finally {
  await conn.end();
}
