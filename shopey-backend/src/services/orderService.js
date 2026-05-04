const pool = require('../config/db');
const { calculateDelivery } = require('../utils/deliveryUtils');

module.exports = async (pending) => {
  const items = JSON.parse(pending.items);
  const userId = pending.user_id;

  const orderCode = `ORD-${Date.now()}`;

  let total = 0;
  let shopSet = new Set();

  // parse wallet/voucher used (from description hack)
  let wallet_used = 0;
  let voucher_used = 0;

  if (pending.description.includes('||wallet:')) {
    const parts = pending.description.split('||');
    wallet_used = Number(parts.find(p => p.startsWith('wallet:'))?.split(':')[1] || 0);
    voucher_used = Number(parts.find(p => p.startsWith('voucher:'))?.split(':')[1] || 0);
  }

  for (let item of items) {
    const p = await pool.query(`SELECT * FROM products WHERE id=$1`, [item.product_id]);
    const prod = p.rows[0];

    total += prod.price * item.quantity;
    shopSet.add(prod.shop_id);
  }

  const order = await pool.query(
    `INSERT INTO orders
    (order_code, user_id, total_amount, delivery_fee, county, town, description, wallet_used, voucher_used)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      orderCode,
      userId,
      total,
      calculateDelivery(total, 'low', pending.county),
      pending.county,
      pending.town,
      pending.description,
      wallet_used,
      voucher_used
    ]
  );

  const orderId = order.rows[0].id;

  // deduct wallet/voucher now (final)
  await pool.query(
    `UPDATE users
     SET wallet_balance = wallet_balance - $1,
         voucher_balance = voucher_balance - $2
     WHERE id = $3`,
    [wallet_used, voucher_used, userId]
  );

  // items + referral
  const user = await pool.query(`SELECT referred_by FROM users WHERE id=$1`, [userId]);
  const referrer = user.rows[0].referred_by;

  for (let item of items) {
    const p = await pool.query(`SELECT * FROM products WHERE id=$1`, [item.product_id]);
    const prod = p.rows[0];

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1,$2,$3,$4)`,
      [orderId, item.product_id, item.quantity, prod.price]
    );

    await pool.query(
      `UPDATE products SET stock = stock - $1 WHERE id=$2`,
      [item.quantity, item.product_id]
    );

    // 💰 referral (only for featured users)
    if (referrer) {
      const referrerUser = await pool.query(`SELECT is_featured FROM users WHERE id=$1`, [referrer]);
      if (referrerUser.rows[0].is_featured) {
        const earning = prod.profit * 0.2;

        await pool.query(
          `INSERT INTO referral_earnings (user_id, order_id, amount)
           VALUES ($1,$2,$3)`,
          [referrer, orderId, earning]
        );

        await pool.query(
          `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id=$2`,
          [earning, referrer]
        );
      }
    }
  }

  for (let shopId of shopSet) {
    await pool.query(
      `INSERT INTO order_shops (order_id, shop_id)
       VALUES ($1,$2)`,
      [orderId, shopId]
    );
  }

  // Generate and email receipt
  const generateReceipt = require('./receiptService');
  const filePath = `receipts/order_${orderId}.pdf`;
  generateReceipt(order.rows[0], items, filePath);

  // Email receipt to user
  const userEmail = await pool.query(`SELECT email FROM users WHERE id=$1`, [userId]);
  const sendEmail = require('./emailService');
  await sendEmail(userEmail.rows[0].email, 'Order Receipt', 'Your order receipt is attached.', [
    {
      filename: 'receipt.pdf',
      path: filePath
    }
  ]);
};
