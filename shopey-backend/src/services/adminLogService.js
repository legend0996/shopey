const pool = require('../config/db');

module.exports = async (action) => {
  try {
    await pool.query(
      `INSERT INTO admin_logs (action) VALUES ($1)`,
      [action]
    );
  } catch (err) {
    console.error('Admin log failed:', err.message);
  }
};