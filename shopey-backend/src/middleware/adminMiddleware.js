const jwt = require('jsonwebtoken');
const { getTokenFromRequest } = require('../utils/authToken');

module.exports = (req, res, next) => {
  const token = getTokenFromRequest(req, ['admin_token']);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};