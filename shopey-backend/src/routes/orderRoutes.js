const express = require('express');
const router = express.Router();

const order = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/checkout', authMiddleware, order.checkout);
router.post('/create', authMiddleware, order.createOrder);
router.get('/my-orders', authMiddleware, order.getUserOrders);
router.get('/my-orders/:id', authMiddleware, order.getUserOrderDetails);
router.get('/receipt/:id', authMiddleware, order.downloadReceipt);

module.exports = router;