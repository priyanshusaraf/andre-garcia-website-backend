const express = require('express');
const router = express.Router();
const { getOrdersByUser, getOrderById, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.get('/', authenticateToken, getOrdersByUser);
router.get('/:id', authenticateToken, getOrderById);
router.post('/', authenticateToken, createOrder);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.get('/notifications', authenticateToken, orderController.getNotifications);

module.exports = router; 