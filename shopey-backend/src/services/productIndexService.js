const pool = require('../config/db');

let ensured = false;

async function ensureProductSearchIndexes() {
  if (ensured) return;

  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin (description gin_trgm_ops)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON products USING gin (brand gin_trgm_ops)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_tags_gin ON products USING gin (tags)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products (price)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock)`);
    ensured = true;
  } catch (err) {
    console.warn('[product-index] index setup skipped:', err.message);
  }
}

module.exports = {
  ensureProductSearchIndexes,
};
