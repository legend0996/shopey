const pool = require('../config/db');

// 🚚 ASSIGN DELIVERY
exports.assignDelivery = async (req, res) => {
  const { order_id, rider_name, rider_phone } = req.body;

  try {
    await pool.query(
      `INSERT INTO deliveries (order_id, delivery_person, rider_phone, status, assigned_at)
       VALUES ($1,$2,$3,'assigned',NOW())`,
      [order_id, rider_name, rider_phone]
    );

    res.json({ message: 'Assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📍 UPDATE DELIVERY STATUS
exports.updateDeliveryStatus = async (req, res) => {
  const { id, status } = req.body;

  try {
    await pool.query(
      `UPDATE deliveries SET status=$1 WHERE id=$2`,
      [status, id]
    );

    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
