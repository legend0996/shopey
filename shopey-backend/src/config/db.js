const { neon, neonConfig } = require('@neondatabase/serverless');

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DB_URL);

// Wrap neon HTTP driver in a pg-compatible pool-like interface
const pool = {
  async query(text, params) {
    const rows = await sql.query(text, params ?? []);
    return { rows, rowCount: rows.length };
  },
};

module.exports = pool;