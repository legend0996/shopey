const express = require('express');
const router = express.Router();

const mpesa = require('../controllers/mpesaController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/pay', authMiddleware, mpesa.pay);
router.post('/callback', mpesa.callback);

module.exports = router;