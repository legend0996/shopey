const express = require('express');
const router = express.Router();

const auth = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', auth.register);
router.post('/verify', auth.verifyEmail);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.get('/me', authMiddleware, auth.getMe);

module.exports = router;