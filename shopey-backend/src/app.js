const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
	res.status(200).json({ ok: true });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/mpesa', require('./routes/mpesaRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/rider', require('./routes/riderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

module.exports = app;