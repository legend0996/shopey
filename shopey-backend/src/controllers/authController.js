const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateCode = require('../utils/generateCode');
const sendEmail = require('../services/emailService');


// ✅ REGISTER
exports.register = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query(
      `INSERT INTO users (email, phone, password)
       VALUES ($1, $2, $3) RETURNING *`,
      [email, phone, hashedPassword]
    );

    const code = generateCode();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await pool.query(
      `INSERT INTO verification_codes (user_id, code, expires_at)
       VALUES ($1, $2, $3)`,
      [user.rows[0].id, code, expires]
    );

    try {
      await sendEmail(email, 'Verify your account', `Your code is ${code}`);
    } catch (err) {
      console.error("Email failed:", err.message);
    }

    res.json({
      message: 'Registered. If email not received, request new code.'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });

    const record = await pool.query(
      `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2`,
      [user.rows[0].id, code]
    );

    if (!record.rows.length) return res.status(400).json({ error: 'Invalid code' });

    if (new Date() > record.rows[0].expires_at)
      return res.status(400).json({ error: 'Code expired' });

    await pool.query(
      `UPDATE users SET is_verified = TRUE WHERE id = $1`,
      [user.rows[0].id]
    );

    res.json({ message: 'Account verified' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (!user.rows.length)
      return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.rows[0].password);

    if (!valid)
      return res.status(400).json({ error: 'Invalid password' });

    if (!user.rows[0].is_verified)
      return res.status(403).json({ error: 'Verify your email first' });

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ FORGOT PASSWORD (SEND CODE)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (!user.rows.length)
      return res.status(404).json({ error: 'User not found' });

    const code = generateCode();
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      `INSERT INTO verification_codes (user_id, code, expires_at)
       VALUES ($1, $2, $3)`,
      [user.rows[0].id, code, expires]
    );

    await sendEmail(email, 'Reset Password Code', `Your code is ${code}`);

    res.json({ message: 'Code sent to email' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    const record = await pool.query(
      `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2`,
      [user.rows[0].id, code]
    );

    if (!record.rows.length)
      return res.status(400).json({ error: 'Invalid code' });

    if (new Date() > record.rows[0].expires_at)
      return res.status(400).json({ error: 'Code expired' });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashed, user.rows[0].id]
    );

    res.json({ message: 'Password reset successful' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ME
exports.getMe = async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT id, email, phone, wallet_balance, voucher_balance
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};