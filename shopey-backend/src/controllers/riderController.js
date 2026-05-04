const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.riderLogin = async (req, res) => {
  const { phone, password } = req.body;

  const rider = await pool.query(
    `SELECT * FROM riders WHERE phone=$1`,
    [phone]
  );

  if (!rider.rows.length) {
    return res.status(404).json({ error: 'Rider not found' });
  }

  const valid = await bcrypt.compare(password, rider.rows[0].password);

  if (!valid) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  const token = jwt.sign(
    { id: rider.rows[0].id, role: 'rider' },
    process.env.JWT_SECRET
  );

  res.json({ token });
};

// 🚚 RIDER DASHBOARD (CORE FEATURE)
exports.getMyDeliveries = async (req, res) => {
  const riderId = req.rider.id;

  const deliveries = await pool.query(`
    SELECT
      d.id,
      d.status,
      o.order_code,
      o.county,
      o.town,
      o.description
    FROM deliveries d
    JOIN orders o ON d.order_id = o.id
    WHERE d.rider_id = $1
    ORDER BY d.assigned_at DESC
  `, [riderId]);

  res.json(deliveries.rows);
};

// 📦 Get delivery details
exports.getDeliveryDetails = async (req, res) => {
  const { id } = req.params;

  const items = await pool.query(`
    SELECT
      oi.quantity,
      p.name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = (
      SELECT order_id FROM deliveries WHERE id=$1
    )
  `, [id]);

  res.json(items.rows);
};

// 🔄 Update delivery status (rider side)
exports.updateMyStatus = async (req, res) => {
  const { delivery_id, status } = req.body;

  await pool.query(
    `UPDATE deliveries SET status=$1 WHERE id=$2`,
    [status, delivery_id]
  );

  res.json({ message: 'Updated' });
};