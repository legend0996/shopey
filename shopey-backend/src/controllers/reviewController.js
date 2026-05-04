const pool = require('../config/db');

// 🧱 ADD REVIEW
exports.addReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1,$2,$3,$4)`,
      [userId, product_id, rating, comment]
    );

    res.json({ message: 'Review added' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 GET PRODUCT REVIEWS
exports.getReviews = async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE product_id=$1`,
      [product_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ GET AVERAGE RATING
exports.getRating = async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT AVG(rating) FROM reviews WHERE product_id=$1`,
      [product_id]
    );

    res.json({ rating: result.rows[0].avg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};