const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateCode = require('../utils/generateCode');
const sendEmail = require('../services/emailService');
const logAdmin = require('../services/adminLogService');


// ✅ STEP 1: LOGIN (send code)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminRes = await pool.query(
      `SELECT * FROM admins WHERE email = $1`,
      [email]
    );

    if (!adminRes.rows.length) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = adminRes.rows[0];

    // 🚫 Check block
    if (admin.blocked_until && new Date() < admin.blocked_until) {
      return res.status(403).json({
        error: 'Too many attempts. Try again later.'
      });
    }

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      const attempts = admin.failed_attempts + 1;

      // 🚫 Block after 3 attempts
      if (attempts >= 3) {
        const blockTime = new Date(Date.now() + 30 * 60 * 1000);

        await pool.query(
          `UPDATE admins
           SET failed_attempts = 0, blocked_until = $1
           WHERE id = $2`,
          [blockTime, admin.id]
        );

        await logAdmin(`Admin ${email} blocked for 30 mins`);

        return res.status(403).json({
          error: 'Too many failed attempts. Blocked for 30 minutes.'
        });
      }

      await pool.query(
        `UPDATE admins SET failed_attempts = $1 WHERE id = $2`,
        [attempts, admin.id]
      );

      return res.status(400).json({ error: 'Invalid password' });
    }

    // ✅ Reset attempts on success
    await pool.query(
      `UPDATE admins
       SET failed_attempts = 0, blocked_until = NULL
       WHERE id = $1`,
      [admin.id]
    );

    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO admin_login_codes (admin_id, code, expires_at)
       VALUES ($1, $2, $3)`,
      [admin.id, code, expires]
    );

    await sendEmail(email, 'Admin Login Code', `Your login code is ${code}`);

    await logAdmin(`Admin ${email} requested login code`);

    res.json({ message: 'Code sent to email' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ STEP 2: VERIFY CODE
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const adminRes = await pool.query(
      `SELECT * FROM admins WHERE email = $1`,
      [email]
    );

    if (!adminRes.rows.length) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = adminRes.rows[0];

    const recordRes = await pool.query(
      `SELECT * FROM admin_login_codes
       WHERE admin_id = $1 AND code = $2 AND used = FALSE`,
      [admin.id, code]
    );

    if (!recordRes.rows.length) {
      return res.status(400).json({ error: 'Invalid or used code' });
    }

    const record = recordRes.rows[0];

    if (new Date() > record.expires_at) {
      return res.status(400).json({ error: 'Code expired' });
    }

    // 🔒 Mark code as used
    await pool.query(
      `UPDATE admin_login_codes SET used = TRUE WHERE id = $1`,
      [record.id]
    );

    // 🔐 Generate token
    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAdmin(`Admin ${email} logged in successfully`);

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 ADMIN DASHBOARD (BASIC STATS)
exports.dashboard = async (req, res) => {
  try {
    const totalOrders = await pool.query(`SELECT COUNT(*) FROM orders`);
    const totalRevenue = await pool.query(`SELECT SUM(total_amount) FROM orders`);
    const users = await pool.query(`SELECT COUNT(*) FROM users`);

    res.json({
      total_orders: totalOrders.rows[0].count,
      total_revenue: totalRevenue.rows[0].sum,
      users: users.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 GET ALL ORDERS
exports.getOrders = async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT o.*, u.email, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json(orders.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 GET FULL ORDER DETAILS
exports.getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const items = await pool.query(`
      SELECT 
        oi.quantity,
        oi.price,
        p.name AS product_name,
        s.name AS shop_name,
        s.phone AS shop_phone,
        s.paybill
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN shops s ON p.shop_id = s.id
      WHERE oi.order_id = $1
    `, [id]);

    res.json(items.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🏪 CREATE SHOP
exports.createShop = async (req, res) => {
  const { name, phone, paybill, location } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO shops (name, phone, paybill, location)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, phone, paybill, location]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ FEATURE USER
exports.featureUser = async (req, res) => {
  const { user_id } = req.body;

  const code = `REF-${Date.now()}`;

  try {
    await pool.query(
      `UPDATE users
       SET is_featured=TRUE, referral_code=$1
       WHERE id=$2`,
      [code, user_id]
    );

    res.json({ message: 'User featured' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ FEATURE PRODUCT
exports.featureProduct = async (req, res) => {
  const { product_id } = req.body;

  try {
    await pool.query(
      `UPDATE products SET is_featured=TRUE WHERE id=$1`,
      [product_id]
    );

    res.json({ message: 'Product featured' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧱 ORDER STATUS UPDATE
exports.updateOrderStatus = async (req, res) => {
  const { order_id, status } = req.body;

  const allowedStatuses = ['pending', 'paid', 'processing', 'picked', 'in_transit', 'delivered', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await pool.query(
      `UPDATE orders SET status=$1 WHERE id=$2`,
      [status, order_id]
    );

    res.json({ message: 'Order status updated' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚚 ASSIGN DELIVERY
exports.assignDelivery = async (req, res) => {
  const { order_id, rider_id } = req.body;

  try {
    // check if already assigned
    const existing = await pool.query(
      `SELECT * FROM deliveries WHERE order_id=$1`,
      [order_id]
    );

    if (existing.rows.length) {
      return res.status(400).json({ error: 'Already assigned' });
    }

    await pool.query(
      `INSERT INTO deliveries
       (order_id, rider_id, status, assigned_at)
       VALUES ($1,$2,'assigned',NOW())`,
      [order_id, rider_id]
    );

    // update order status
    await pool.query(
      `UPDATE orders SET status='processing' WHERE id=$1`,
      [order_id]
    );

    res.json({ message: 'Delivery assigned' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔄 UPDATE DELIVERY STATUS
exports.updateDeliveryStatus = async (req, res) => {
  const { delivery_id, status } = req.body;

  try {
    await pool.query(
      `UPDATE deliveries SET status=$1 WHERE id=$2`,
      [status, delivery_id]
    );

    // update order status automatically
    if (status === 'picked') {
      await pool.query(
        `UPDATE orders SET status='picked' WHERE id=(SELECT order_id FROM deliveries WHERE id=$1)`,
        [delivery_id]
      );
    }

    if (status === 'in_transit') {
      await pool.query(
        `UPDATE orders SET status='in_transit' WHERE id=(SELECT order_id FROM deliveries WHERE id=$1)`,
        [delivery_id]
      );
    }

    if (status === 'delivered') {
      await pool.query(
        `UPDATE orders SET status='delivered' WHERE id=(SELECT order_id FROM deliveries WHERE id=$1)`,
        [delivery_id]
      );
    }

    res.json({ message: 'Delivery updated' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 FULL ORDER VIEW (GROUPED BY SHOP)
exports.getFullOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        oi.quantity,
        oi.price,
        p.name AS product_name,
        s.id AS shop_id,
        s.name AS shop_name,
        s.phone,
        s.paybill
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN shops s ON p.shop_id = s.id
      WHERE oi.order_id = $1
    `, [id]);

    // group by shop
    const grouped = {};

    result.rows.forEach(item => {
      if (!grouped[item.shop_id]) {
        grouped[item.shop_id] = {
          shop_name: item.shop_name,
          phone: item.phone,
          paybill: item.paybill,
          items: []
        };
      }

      grouped[item.shop_id].items.push({
        product: item.product_name,
        quantity: item.quantity,
        price: item.price
      });
    });

    res.json(grouped);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};