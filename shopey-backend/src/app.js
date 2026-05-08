const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

const rawOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '';
const allowedOrigins = rawOrigins
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

const allowLocalhost = process.env.NODE_ENV !== 'production';

function isAllowedOrigin(origin = '') {
	if (!origin) return true;

	if (allowedOrigins.includes(origin)) return true;

	if (allowLocalhost && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
		return true;
	}

	return false;
}

app.set('trust proxy', 1);

app.use(cors({
	origin(origin, callback) {
		if (isAllowedOrigin(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;