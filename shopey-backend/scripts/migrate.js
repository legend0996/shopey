require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = `
-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id          SERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  failed_attempts INT NOT NULL DEFAULT 0,
  blocked_until   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- OTP codes table
CREATE TABLE IF NOT EXISTS admin_login_codes (
  id         SERIAL PRIMARY KEY,
  admin_id   INT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

(async () => {
  console.log('Running admin migration…');
  const db = neon(process.env.DB_URL);
  await db.query(sql);
  console.log('✅  admins + admin_login_codes tables ready');
})().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
