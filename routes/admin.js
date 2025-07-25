const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { productUpload, bannerUpload, heroUpload } = require('../middleware/upload');
const adminController = require('../controllers/adminController');

// All routes below require admin authentication
router.use(authenticateToken, requireAdmin);

// ORDERS MANAGEMENT
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id', adminController.updateOrderStatus);

// STATS AND ANALYTICS
router.get('/stats', adminController.getStats);

// USERS MANAGEMENT
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// PRODUCTS MANAGEMENT
router.get('/products', adminController.getAllProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/featured', adminController.setProductFeatured);
router.patch('/products/:id/new', adminController.setProductNew);
router.patch('/products/:id/sale', adminController.setProductSale);
router.patch('/products/:id/stock', adminController.updateProductStock); // Legacy

// SALE BANNERS MANAGEMENT
router.get('/sale-banners', adminController.getAllSaleBanners);
router.post('/sale-banners', adminController.createSaleBanner);
router.put('/sale-banners/:id', adminController.updateSaleBanner);
router.delete('/sale-banners/:id', adminController.deleteSaleBanner);
router.patch('/sale-banners/:id/active', adminController.setSaleBannerActive);

// HERO IMAGES MANAGEMENT
router.get('/hero-images', adminController.getHeroImages);
router.put('/hero-images', adminController.updateHeroImages);

// IMAGE UPLOAD ROUTES
router.post('/upload/product-image', productUpload, adminController.uploadProductImage);
router.post('/upload/banner-image', bannerUpload, adminController.uploadBannerImage);
router.post('/upload/hero-image', heroUpload, adminController.uploadHeroImage);

module.exports = router; 