const express = require('express');
const { 
  createOrder, 
  verifyPayment, 
  getUserOrders, 
  getOrderDetails,
  getAllOrders,
  getDashboardStats
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// User routes (protected)
router.post('/create-order', authenticateToken, createOrder);
router.post('/verify-payment', authenticateToken, verifyPayment);
router.get('/orders', authenticateToken, getUserOrders);
router.get('/orders/:orderId', authenticateToken, getOrderDetails);

// Admin routes (protected + admin required)
router.get('/admin/orders', authenticateToken, getAllOrders);
router.get('/admin/dashboard-stats', authenticateToken, getDashboardStats);

module.exports = router; 