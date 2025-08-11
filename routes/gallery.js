const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Public route to get all active gallery images
// GET /api/gallery-images
router.get('/', galleryController.getAllGalleryImages);

module.exports = router;