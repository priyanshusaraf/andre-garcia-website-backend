const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const SaleBanner = require('../models/saleBanner');
const AdminSettings = require('../models/adminSettings');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// ORDERS MANAGEMENT
async function getAllOrders(req, res) {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        users: true,
        order_items: { include: { products: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  
  console.log('Admin controller - Received update request:', { id, status, trackingNumber, body: req.body });
  console.log('Admin controller - Status type:', typeof status);
  console.log('Admin controller - Status value:', status);
  console.log('Admin controller - Status JSON:', JSON.stringify(status));
  console.log('Admin controller - Status length:', status?.length);
  
  // Validate status
  const validStatuses = ['pending', 'rejected', 'in_transit', 'completed', 'confirmed'];
  if (!status || !validStatuses.includes(status.trim())) {
    console.log('Invalid status:', status);
    console.log('Valid statuses:', validStatuses);
    console.log('Status includes check:', validStatuses.map(s => ({ status: s, matches: s === status })));
    return res.status(400).json({ message: 'Invalid status. Must be: pending, rejected, in_transit, completed, or confirmed' });
  }
  
  // Validate tracking number for in_transit status
  if (status === 'in_transit' && (!trackingNumber || trackingNumber.trim() === '')) {
    console.log('Missing tracking number for in_transit status');
    return res.status(400).json({ message: 'Tracking number is required when status is in_transit' });
  }
  
  try {
    const order = await Order.updateStatus(id, status, trackingNumber);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// STATS AND ANALYTICS
async function getStats(req, res) {
  try {
    const totalOrders = await prisma.orders.count();
    const totalRevenue = await prisma.orders.aggregate({
      _sum: { total_amount: true }
    });
    
    const totalUsers = await prisma.users.count();
    const totalProducts = await prisma.products.count();
    const activeProducts = await prisma.products.count({
      where: { stock: { gt: 0 } }
    });
    
    // Last 7 days revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRevenue = await prisma.orders.aggregate({
      where: {
        created_at: { gte: sevenDaysAgo }
      },
      _sum: { total_amount: true }
    });

    // Orders per day for last 7 days
    const ordersPerDay = await prisma.orders.groupBy({
      by: ['created_at'],
      _count: { id: true },
      where: {
        created_at: { gte: sevenDaysAgo }
      },
      orderBy: { created_at: 'asc' }
    });

    // Order status distribution
    const orderStatusStats = await prisma.orders.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await prisma.orders.groupBy({
      by: ['created_at'],
      _sum: { total_amount: true },
      _count: { id: true },
      where: {
        created_at: { gte: sixMonthsAgo },
        status: { not: 'rejected' } // Only count non-rejected orders
      },
      orderBy: { created_at: 'asc' }
    });

    // Process monthly revenue data
    const monthlyRevenueData = {};
    monthlyRevenue.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenueData[monthKey]) {
        monthlyRevenueData[monthKey] = { revenue: 0, orders: 0 };
      }
      
      monthlyRevenueData[monthKey].revenue += parseFloat(item._sum.total_amount || 0);
      monthlyRevenueData[monthKey].orders += item._count.id;
    });

    // Order status for fulfillment tracking
    const pendingOrders = await prisma.orders.count({ where: { status: 'pending' } });
    const confirmedOrders = await prisma.orders.count({ where: { status: 'confirmed' } });
    const inTransitOrders = await prisma.orders.count({ where: { status: 'in_transit' } });
    const completedOrders = await prisma.orders.count({ where: { status: 'completed' } });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total_amount || 0,
      recentRevenue: recentRevenue._sum.total_amount || 0,
      totalUsers,
      totalProducts,
      activeProducts,
      ordersPerDay,
      orderStatusStats,
      monthlyRevenueData,
      fulfillmentStats: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        inTransit: inTransitOrders,
        completed: completedOrders
      },
      pendingOrders,
      totalCompletedOrders: completedOrders
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// USERS MANAGEMENT
async function getAllUsers(req, res) {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        is_admin: true,
        created_at: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await User.remove(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// PRODUCTS MANAGEMENT
async function getAllProducts(req, res) {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function createProduct(req, res) {
  try {
    console.log('Creating product with data:', req.body);
    const productData = req.body;
    const product = await Product.create(productData);
    console.log('Product created successfully:', product);
    res.status(201).json(product);
  } catch (err) {
    console.error('Product creation error:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  try {
    const productData = req.body;
    const product = await Product.update(id, productData);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    await Product.remove(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function setProductFeatured(req, res) {
  const { id } = req.params;
  const { is_featured } = req.body;
  try {
    const product = await Product.setFeatured(id, is_featured);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function setProductNew(req, res) {
  const { id } = req.params;
  const { is_new } = req.body;
  try {
    const product = await Product.setNew(id, is_new);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function setProductSale(req, res) {
  const { id } = req.params;
  const saleData = req.body;
  try {
    const product = await Product.setSale(id, saleData);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// SALE BANNERS MANAGEMENT
async function getAllSaleBanners(req, res) {
  try {
    const banners = await SaleBanner.getAll();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function createSaleBanner(req, res) {
  try {
    const bannerData = req.body;
    const banner = await SaleBanner.create(bannerData);
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateSaleBanner(req, res) {
  const { id } = req.params;
  try {
    const bannerData = req.body;
    const banner = await SaleBanner.update(id, bannerData);
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function deleteSaleBanner(req, res) {
  const { id } = req.params;
  try {
    await SaleBanner.remove(id);
    res.json({ message: 'Sale banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function setSaleBannerActive(req, res) {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const banner = await SaleBanner.setActive(id, is_active);
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Legacy function for compatibility
async function updateProductStock(req, res) {
  const { id } = req.params;
  const { stock } = req.body;
  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ message: 'Invalid stock value' });
  }
  try {
    const product = await Product.update(id, { stock });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// HERO IMAGES MANAGEMENT
async function getHeroImages(req, res) {
  try {
    const heroImages = await AdminSettings.get('hero_images');
    const images = heroImages ? JSON.parse(heroImages) : [];
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateHeroImages(req, res) {
  try {
    const { images } = req.body;
    await AdminSettings.set('hero_images', JSON.stringify(images));
    res.json({ message: 'Hero images updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// IMAGE UPLOAD FUNCTIONS
async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imageUrl = `http://localhost:5000/uploads/products/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function uploadBannerImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imageUrl = `http://localhost:5000/uploads/banners/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function uploadHeroImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imageUrl = `http://localhost:5000/uploads/hero/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  // Orders
  getAllOrders,
  updateOrderStatus,
  
  // Stats
  getStats,
  
  // Users
  getAllUsers,
  deleteUser,
  
  // Products
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductFeatured,
  setProductNew,
  setProductSale,
  updateProductStock, // Legacy
  
  // Sale Banners
  getAllSaleBanners,
  createSaleBanner,
  updateSaleBanner,
  deleteSaleBanner,
  setSaleBannerActive,
  
  // Hero Images
  getHeroImages,
  updateHeroImages,
  
  // Image Uploads
  uploadProductImage,
  uploadBannerImage,
  uploadHeroImage
}; 