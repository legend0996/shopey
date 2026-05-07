const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function ensureDefaultAdmin() {
  const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  try {
    if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
      console.warn('[admin-bootstrap] ADMIN_EMAIL or ADMIN_PASSWORD not set in env. Skipping admin bootstrap.');
      return;
    }
    const existing = await pool.query('SELECT id FROM admins WHERE email = $1 LIMIT 1', [
      DEFAULT_ADMIN_EMAIL,
    ]);

    if (existing.rows.length) {
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await pool.query(
      `INSERT INTO admins (email, password)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      [DEFAULT_ADMIN_EMAIL, hashedPassword]
    );

    console.log(`[admin-bootstrap] Created default admin: ${DEFAULT_ADMIN_EMAIL}`);
  } catch (error) {
    console.error('[admin-bootstrap] Failed to ensure default admin:', error.message);
  }
}

module.exports = { ensureDefaultAdmin };
