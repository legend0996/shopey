const calculateDelivery = (total, fragility, county) => {
  let fee = 0;

  // value-based
  if (total < 5000) fee = 190;
  else if (total < 10000) fee = 250;
  else if (total < 20000) fee = 320;
  else if (total < 40000) fee = 400;
  else fee = 700;

  // fragility
  if (fragility === 'medium') fee += 50;
  if (fragility === 'high') fee += 100;

  // county adjustment
  const nearby = ['Nairobi', 'Kiambu', 'Machakos'];

  if (nearby.includes(county)) fee += 70;
  else fee += 120;

  return fee;
};


const pool = require('../config/db');


// 🧮 CALCULATE CHECKOUT
exports.checkout = async (req, res) => {
  const { items, county } = req.body;
  const userId = req.user.id;

  try {
    let total = 0;
    let fragility = 'low';

    for (let item of items) {
      const product = await pool.query(
        `SELECT * FROM products WHERE id = $1`,
        [item.product_id]
      );

      const p = product.rows[0];

      total += p.price * item.quantity;

      // pick highest fragility
      if (p.fragility === 'high') fragility = 'high';
      else if (p.fragility === 'medium' && fragility !== 'high')
        fragility = 'medium';
    }

    // Delivery
    const delivery_fee = calculateDelivery(total, fragility, county);

    // Get user balances
    const user = await pool.query(
      `SELECT wallet_balance, voucher_balance FROM users WHERE id=$1`,
      [userId]
    );

    let wallet = Number(user.rows[0].wallet_balance);
    let voucher = Number(user.rows[0].voucher_balance);

    let final = total + delivery_fee;

    // Apply voucher first
    if (voucher > 0) {
      const used = Math.min(voucher, final);
      final -= used;
      voucher -= used;
    }

    // Apply wallet
    if (wallet > 0) {
      const used = Math.min(wallet, final);
      final -= used;
      wallet -= used;
    }

    res.json({
      total,
      delivery_fee,
      final_amount: final,
      remaining_wallet: wallet,
      remaining_voucher: voucher
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.createOrder = async (req, res) => {
  const { items, county, town, description } = req.body;
  const userId = req.user.id;

  try {
    const orderCode = `ORD-${Date.now()}`;

    let total = 0;
    let shopSet = new Set();

    // Calculate total + collect shops
    for (let item of items) {
      const product = await pool.query(
        `SELECT * FROM products WHERE id=$1`,
        [item.product_id]
      );

      const p = product.rows[0];

      total += p.price * item.quantity;
      shopSet.add(p.shop_id);
    }

    // Delivery (based on total)
    const delivery_fee = calculateDelivery(total, 'low', county);

    const order = await pool.query(
      `INSERT INTO orders
      (order_code, user_id, total_amount, delivery_fee, county, town, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [orderCode, userId, total, delivery_fee, county, town, description]
    );

    const orderId = order.rows[0].id;

    const user = await pool.query(
      `SELECT referred_by FROM users WHERE id = $1`,
      [userId]
    );

    if (user.rows[0].referred_by) {
      const referrer = user.rows[0].referred_by;

      for (let item of items) {
        const product = await pool.query(
          `SELECT profit FROM products WHERE id=$1`,
          [item.product_id]
        );

        const profit = product.rows[0].profit;
        const earning = profit * 0.2; // 20% (make dynamic later)

        await pool.query(
          `INSERT INTO referral_earnings (user_id, order_id, amount)
           VALUES ($1, $2, $3)`,
          [referrer, orderId, earning]
        );

        await pool.query(
          `UPDATE users
           SET wallet_balance = wallet_balance + $1
           WHERE id = $2`,
          [earning, referrer]
        );
      }
    }

    // Insert items
    for (let item of items) {
      const product = await pool.query(
        `SELECT * FROM products WHERE id=$1`,
        [item.product_id]
      );

      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1,$2,$3,$4)`,
        [orderId, item.product_id, item.quantity, product.rows[0].price]
      );

      // Reduce stock
      await pool.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Insert shops
    for (let shopId of shopSet) {
      await pool.query(
        `INSERT INTO order_shops (order_id, shop_id)
         VALUES ($1, $2)`,
        [orderId, shopId]
      );
    }

    res.json(order.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📦 GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await pool.query(
      `SELECT * FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(orders.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 GET SINGLE ORDER (FULL DETAILS)
exports.getUserOrderDetails = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (!order.rows.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await pool.query(
      `SELECT 
        oi.quantity,
        oi.price,
        p.name,
        p.product_id
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const delivery = await pool.query(
      `SELECT * FROM deliveries WHERE order_id = $1`,
      [id]
    );

    res.json({
      order: order.rows[0],
      items: items.rows,
      delivery: delivery.rows[0] || null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 DOWNLOAD RECEIPT
exports.downloadReceipt = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  pool.query(`SELECT id FROM orders WHERE id = $1 AND user_id = $2 LIMIT 1`, [id, userId])
    .then((result) => {
      if (!result.rows.length) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      const filePath = `receipts/order_${id}.pdf`;

      res.download(filePath);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};