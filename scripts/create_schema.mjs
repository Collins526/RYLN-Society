import pg from 'pg'; import fs from 'fs';
const { Pool } = pg;
function getEnv(name){
  // try .env alongside api-server
  const envPath = new URL('../artifacts/api-server/.env', import.meta.url).pathname.replace(/^\/?([A-Za-z]:)?/, '');
  let env = {};
  try{
    const txt = fs.readFileSync(envPath, 'utf8');
    for(const line of txt.split(/\r?\n/)){
      const m = line.match(/^\s*([^=]+)=(.*)$/);
      if(m) env[m[1]] = m[2];
    }
  }catch(e){}
  return process.env[name] || env[name];
}
const connectionString = getEnv('DATABASE_URL');
if(!connectionString){
  console.error('DATABASE_URL not set in environment or artifacts/api-server/.env');
  process.exit(1);
}
console.log('Using DB URL:', connectionString.replace(/:.+@/,'...@'));
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const sql = `
-- enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('admin','member');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
        CREATE TYPE member_status AS ENUM ('pending','active','suspended','rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
        CREATE TYPE gender AS ENUM ('male','female','other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_status') THEN
        CREATE TYPE activity_status AS ENUM ('upcoming','ongoing','completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_category') THEN
        CREATE TYPE gallery_category AS ENUM ('events','community_service','meetings','trainings','workshops');
    END IF;
END$$;

-- tables
CREATE TABLE IF NOT EXISTS members (
  id serial PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  national_id text NOT NULL,
  gender gender NOT NULL,
  date_of_birth text NOT NULL,
  occupation text NOT NULL,
  address text NOT NULL,
  password_hash text NOT NULL,
  role role NOT NULL DEFAULT 'member',
  status member_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  date text NOT NULL,
  location text NOT NULL,
  status activity_status NOT NULL DEFAULT 'upcoming',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery (
  id serial PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  category gallery_category NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id serial PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leadership (
  id serial PRIMARY KEY,
  name text NOT NULL,
  position text NOT NULL,
  bio text NOT NULL,
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

(async function(){
  try{
    console.log('Applying schema...');
    await pool.query(sql);
    const r = await pool.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
    console.log('Created tables:', r.rows.map(r=>r.table_name));
    await pool.end();
    console.log('Done');
  }catch(e){
    console.error('Error applying schema:', e);
    try{ await pool.end(); }catch{};
    process.exit(1);
  }
})();
