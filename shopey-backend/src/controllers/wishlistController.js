const pool = require('../config/db');

// ➕ ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;

  try {
    const normalizedProductId = Number(product_id);
    if (!Number.isFinite(normalizedProductId)) {
      return res.status(400).json({ message: 'product_id must be a valid number' });
    }

    const product = await pool.query(`SELECT id FROM products WHERE id = $1 LIMIT 1`, [normalizedProductId]);
    if (!product.rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, normalizedProductId]
    );

    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;

  try {
    const normalizedProductId = Number(product_id);
    if (!Number.isFinite(normalizedProductId)) {
      return res.status(400).json({ message: 'product_id must be a valid number' });
    }

    await pool.query(
      `DELETE FROM wishlist
       WHERE user_id=$1 AND product_id=$2`,
      [userId, normalizedProductId]
    );

    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📦 GET USER WISHLIST
exports.getWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.is_featured,
        pi.image_url
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi 
        ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 CHECK IF PRODUCT IS IN WISHLIST
exports.checkWishlist = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;

  try {
    const normalizedProductId = Number(product_id);
    if (!Number.isFinite(normalizedProductId)) {
      return res.status(400).json({ message: 'product_id must be a valid number' });
    }

    const result = await pool.query(
      `SELECT * FROM wishlist WHERE user_id=$1 AND product_id=$2`,
      [userId, normalizedProductId]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
