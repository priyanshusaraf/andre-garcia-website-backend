const express = require('express');
const router = express.Router();
const { 
  createReview, 
  getProductReviews, 
  getUserReviews, 
  updateReview, 
  deleteReview, 
  getAllReviews 
} = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', getProductReviews);

// User routes (require authentication)
router.post('/', authenticateToken, createReview);
router.get('/user', authenticateToken, getUserReviews);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

// Admin routes (require admin authentication)
router.get('/admin/all', authenticateToken, requireAdmin, getAllReviews);

module.exports = router; 