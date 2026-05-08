const jwt = require('jsonwebtoken');
const { getTokenFromRequest } = require('../utils/authToken');

module.exports = (req, res, next) => {
  const token = getTokenFromRequest(req, ['auth_token']);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};