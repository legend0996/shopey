const { stkPush } = require('../services/mpesaService');
const createRealOrder = require('../services/orderService');
const pool = require('../config/db');

// ✅ STEP 1: INITIATE PAYMENT (with wallet/voucher deduction)
exports.pay = async (req, res) => {
  const { phone, items, county, town, description } = req.body;
  const userId = req.user.id;

  const formatPhone = require('../utils/formatPhone');

  const formattedPhone = formatPhone(phone);

  if (!formattedPhone) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  try {
    // 1) compute total
    let total = 0;
    let fragility = 'low';

    for (let item of items) {
      const p = await pool.query(`SELECT price, fragility FROM products WHERE id=$1`, [item.product_id]);
      const prod = p.rows[0];
      total += prod.price * item.quantity;

      if (prod.fragility === 'high') fragility = 'high';
      else if (prod.fragility === 'medium' && fragility !== 'high') fragility = 'medium';
    }

    // 2) delivery
    const calculateDelivery = (t, f, c) => {
      let fee = 0;
      if (t < 5000) fee = 190;
      else if (t < 10000) fee = 250;
      else if (t < 20000) fee = 320;
      else if (t < 40000) fee = 400;
      else fee = 700;

      if (f === 'medium') fee += 50;
      if (f === 'high') fee += 100;
      if (c !== 'Nairobi') fee += 100;
      return fee;
    };

    const delivery_fee = calculateDelivery(total, fragility, county);
    let finalAmount = total + delivery_fee;

    // 3) apply voucher + wallet
    const user = await pool.query(
      `SELECT wallet_balance, voucher_balance FROM users WHERE id=$1`,
      [userId]
    );

    let wallet = Number(user.rows[0].wallet_balance);
    let voucher = Number(user.rows[0].voucher_balance);

    let voucher_used = 0;
    let wallet_used = 0;

    if (voucher > 0) {
      voucher_used = Math.min(voucher, finalAmount);
      finalAmount -= voucher_used;
      voucher -= voucher_used;
    }

    if (wallet > 0) {
      wallet_used = Math.min(wallet, finalAmount);
      finalAmount -= wallet_used;
      wallet -= wallet_used;
    }

    // 4) save pending order (store usage)
    const pending = await pool.query(
      `INSERT INTO pending_orders
      (user_id, phone, amount, items, county, town, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [userId, phone, finalAmount, JSON.stringify(items), county, town, description]
    );

    // 5) store wallet/voucher usage temporarily (simple way)
    await pool.query(
      `UPDATE pending_orders
       SET description = description || '||wallet:' || $1 || '||voucher:' || $2
       WHERE id=$3`,
      [wallet_used, voucher_used, pending.rows[0].id]
    );

    // 6) send STK
    const response = await stkPush(formattedPhone, finalAmount);

    await pool.query(
      `UPDATE pending_orders SET checkout_request_id=$1 WHERE id=$2`,
      [response.CheckoutRequestID, pending.rows[0].id]
    );

    await pool.query(
      `INSERT INTO payments (amount, method, status, pending_order_id)
       VALUES ($1,'mpesa','pending',$2)`,
      [finalAmount, pending.rows[0].id]
    );

    res.json(response);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📡 STEP 5: CALLBACK (idempotent + safe)
exports.callback = async (req, res) => {
  const stk = req.body.Body.stkCallback;
  const checkoutId = stk.CheckoutRequestID;

  try {
    const pendingRes = await pool.query(
      `SELECT * FROM pending_orders WHERE checkout_request_id=$1`,
      [checkoutId]
    );

    if (!pendingRes.rows.length) return res.json({ ok: true });

    const pending = pendingRes.rows[0];

    // 🚫 already processed → ignore
    if (pending.processed) return res.json({ ok: true });

    if (stk.ResultCode === 0) {
      const metadata = stk.CallbackMetadata.Item;
      const receipt = metadata.find(i => i.Name === "MpesaReceiptNumber").Value;

      await pool.query(
        `UPDATE payments SET status='paid', transaction_code=$1
         WHERE pending_order_id=$2`,
        [receipt, pending.id]
      );

      await createRealOrder(pending);

      await pool.query(
        `UPDATE pending_orders SET processed=TRUE, status='completed' WHERE id=$1`,
        [pending.id]
      );
    } else {
      await pool.query(
        `UPDATE pending_orders SET status='failed' WHERE id=$1`,
        [pending.id]
      );
    }

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};