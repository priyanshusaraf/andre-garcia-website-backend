const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// TODO: Add admin middleware for create, update, delete
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router; 