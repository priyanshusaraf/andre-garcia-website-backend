const express = require('express');
const router = express.Router();
const { getOrdersByUser, getOrderById, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.get('/', authenticateToken, getOrdersByUser);
router.get('/:id', authenticateToken, getOrderById);
router.post('/', authenticateToken, createOrder);
router.put('/:id/status', authenticateToken, requireAdmin, (req, res, next) => {
  console.log('Order route hit - PUT /:id/status', { params: req.params, body: req.body });
  next();
}, updateOrderStatus);
router.get('/notifications', authenticateToken, orderController.getNotifications);

module.exports = router; 