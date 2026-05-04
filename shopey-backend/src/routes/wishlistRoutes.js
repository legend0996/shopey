const express = require('express');
const router = express.Router();

const wishlist = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, wishlist.addToWishlist);
router.post('/remove', authMiddleware, wishlist.removeFromWishlist);
router.get('/', authMiddleware, wishlist.getWishlist);
router.get('/:product_id', authMiddleware, wishlist.checkWishlist);

module.exports = router;
