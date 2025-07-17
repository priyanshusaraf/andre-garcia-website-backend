const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Product = require('../models/product');
const SaleBanner = require('../models/saleBanner');

// Public routes
router.get('/', getAllProducts);

// Specific named routes MUST come before the dynamic /:id route
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.getFeatured();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/on-sale', async (req, res) => {
  try {
    const products = await Product.getOnSale();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/sale-banners', async (req, res) => {
  try {
    const banners = await SaleBanner.getActive();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/hero-images', async (req, res) => {
  try {
    const AdminSettings = require('../models/adminSettings');
    const heroImages = await AdminSettings.get('hero_images');
    const images = heroImages ? JSON.parse(heroImages) : [];
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Dynamic route MUST come after all specific routes
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router; 