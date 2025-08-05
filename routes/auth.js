const express = require('express');
const router = express.Router();
const { register, login, adminLogin, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.put('/profile', authenticateToken, updateProfile);

module.exports = router; 