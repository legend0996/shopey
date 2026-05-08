const express = require('express');
const router = express.Router();

const admin = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/login', admin.login);
router.post('/verify', admin.verifyCode);
router.get('/me', adminMiddleware, admin.me);
router.get('/dashboard', adminMiddleware, admin.dashboard);
router.get('/orders', adminMiddleware, admin.getOrders);
router.get('/orders/:id', adminMiddleware, admin.getOrderDetails);
router.post('/shops', adminMiddleware, admin.createShop);
router.post('/feature-user', adminMiddleware, admin.featureUser);
router.post('/feature-product', adminMiddleware, admin.featureProduct);

// order actions
router.post('/order/status', adminMiddleware, admin.updateOrderStatus);
router.post('/order/assign', adminMiddleware, admin.assignDelivery);
router.post('/delivery/status', adminMiddleware, admin.updateDeliveryStatus);

// full order view
router.get('/order/:id/full', adminMiddleware, admin.getFullOrder);

module.exports = router;