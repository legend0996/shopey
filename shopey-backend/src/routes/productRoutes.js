const express = require('express');
const router = express.Router();

const product = require('../controllers/productController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Categories
router.post('/category', adminMiddleware, product.createCategory);
router.get('/categories', product.getCategories);

// Products
router.post('/', adminMiddleware, product.createProduct);
router.get('/search', product.searchProducts);
router.get('/suggestions', product.getSearchSuggestions);
router.get('/featured', product.getFeaturedProducts);
router.get('/', product.getProducts);
router.get('/:id', product.getSingleProduct);
router.put('/:id', adminMiddleware, product.updateProduct);
router.delete('/:id', adminMiddleware, product.deleteProduct);
router.post('/:id/gallery', adminMiddleware, product.replaceGallery);
router.patch('/:id/gallery/reorder', adminMiddleware, product.reorderGallery);
router.patch('/:id/gallery/thumbnail', adminMiddleware, product.setThumbnail);
router.delete('/:id/gallery/:imageId', adminMiddleware, product.deleteGalleryImage);

module.exports = router;