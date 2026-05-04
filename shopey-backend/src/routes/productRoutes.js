const express = require('express');
const router = express.Router();

const product = require('../controllers/productController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Categories
router.post('/category', adminMiddleware, product.createCategory);
router.get('/categories', product.getCategories);

// Products
router.post('/', adminMiddleware, product.createProduct);
router.get('/', product.getProducts);
router.get('/:id', product.getSingleProduct);
router.put('/:id', adminMiddleware, product.updateProduct);
router.delete('/:id', adminMiddleware, product.deleteProduct);

// Featured
router.get('/featured', product.getFeaturedProducts);

module.exports = router;