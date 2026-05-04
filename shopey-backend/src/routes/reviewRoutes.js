const express = require('express');
const router = express.Router();

const review = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/review', authMiddleware, review.addReview);
router.get('/reviews/:product_id', review.getReviews);
router.get('/rating/:product_id', review.getRating);

module.exports = router;