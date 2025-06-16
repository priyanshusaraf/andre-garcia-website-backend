const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getCart);
router.post('/add', authenticateToken, addToCart);
router.put('/update', authenticateToken, updateCartItem);
router.delete('/remove', authenticateToken, removeCartItem);
router.delete('/clear', authenticateToken, clearCart);

module.exports = router; 