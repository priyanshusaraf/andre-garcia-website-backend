const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts, getHeroImages, getSaleBanners } = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes for frontend
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/hero-images', getHeroImages);
router.get('/sale-banners', getSaleBanners);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router; 