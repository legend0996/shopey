const express = require('express');
const router = express.Router();

const delivery = require('../controllers/deliveryController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/assign', adminMiddleware, delivery.assignDelivery);
router.put('/status', adminMiddleware, delivery.updateDeliveryStatus);

module.exports = router;
