const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Get all active gallery images for public use
async function getAllGalleryImages(req, res) {
  try {
    const galleryImages = await prisma.gallery_images.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
      select: {
        id: true,
        image_url: true,
        title: true,
        description: true,
        sort_order: true
      }
    });
    
    res.json(galleryImages);
  } catch (err) {
    console.error('Error fetching gallery images:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  getAllGalleryImages,
};