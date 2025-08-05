const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Initialize Razorpay (you'll need to add these to your .env file)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', items, shipping_address } = req.body;
    const userId = req.user.id;

    if (!amount || !items || items.length === 0) {
      return res.status(400).json({ message: 'Amount and items are required' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paisa
      currency,
      receipt: `order_${Date.now()}_${userId}`,
      notes: {
        user_id: userId.toString(),
        item_count: items.length.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in database
    const order = await prisma.orders.create({
      data: {
        user_id: userId,
        total_amount: amount,
        status: 'pending',
        payment_status: 'pending',
        order_id_razorpay: razorpayOrder.id,
        shipping_address: shipping_address || null,
        order_items: {
          create: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price,
          })),
        },
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    res.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      order: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // First find the order by razorpay order ID
    const existingOrder = await prisma.orders.findFirst({
      where: { order_id_razorpay: razorpay_order_id },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order in database using the found order's ID
    const order = await prisma.orders.update({
      where: { id: existingOrder.id },
      data: {
        payment_id: razorpay_payment_id,
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date(),
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of order.order_items) {
      await prisma.products.update({
        where: { id: item.product_id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear user's cart
    await prisma.cart_items.deleteMany({
      where: {
        carts: {
          user_id: order.user_id,
        },
      },
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: order,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                image_url: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalOrders = await prisma.orders.count({
      where: { user_id: userId },
    });

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get single order details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await prisma.orders.findFirst({
      where: {
        id: parseInt(orderId),
        user_id: userId,
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const where = status ? { status } : {};

    const orders = await prisma.orders.findMany({
      where,
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                image_url: true,
                category: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalOrders = await prisma.orders.count({ where });

    // Get revenue statistics
    const revenueStats = await prisma.orders.aggregate({
      where: { payment_status: 'completed' },
      _sum: {
        total_amount: true,
      },
      _count: true,
    });

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
      stats: {
        totalRevenue: revenueStats._sum.total_amount || 0,
        totalCompletedOrders: revenueStats._count,
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};



// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Total revenue
    const totalRevenue = await prisma.orders.aggregate({
      where: { payment_status: 'completed' },
      _sum: { total_amount: true },
    });

    // Monthly revenue
    const monthlyRevenue = await prisma.orders.aggregate({
      where: {
        payment_status: 'completed',
        created_at: { gte: startOfMonth },
      },
      _sum: { total_amount: true },
    });

    // Daily revenue
    const dailyRevenue = await prisma.orders.aggregate({
      where: {
        payment_status: 'completed',
        created_at: { gte: startOfDay },
      },
      _sum: { total_amount: true },
    });

    // Order counts by status
    const orderStats = await prisma.orders.groupBy({
      by: ['status'],
      _count: true,
    });

    // Pending orders count
    const pendingOrders = await prisma.orders.count({
      where: { status: 'pending' },
    });

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue._sum.total_amount || 0,
        monthlyRevenue: monthlyRevenue._sum.total_amount || 0,
        dailyRevenue: dailyRevenue._sum.total_amount || 0,
        pendingOrders,
        orderStats: orderStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  getDashboardStats,
}; 