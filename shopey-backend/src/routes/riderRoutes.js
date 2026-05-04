const express = require('express');
const router = express.Router();

const rider = require('../controllers/riderController');
const riderMiddleware = require('../middleware/riderMiddleware');

router.post('/login', rider.riderLogin);

router.get('/deliveries', riderMiddleware, rider.getMyDeliveries);
router.get('/deliveries/:id', riderMiddleware, rider.getDeliveryDetails);
router.post('/status', riderMiddleware, rider.updateMyStatus);

module.exports = router;