const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'rider') {
      return res.status(403).json({ error: 'Not rider' });
    }

    req.rider = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};