const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const Review = {
  async create(data) {
    return await prisma.reviews.create({ data });
  },

  async getById(id) {
    return await prisma.reviews.findUnique({ 
      where: { id: Number(id) },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            image_url: true
          }
        }
      }
    });
  },

  async getByProductId(productId) {
    return await prisma.reviews.findMany({
      where: { product_id: Number(productId) },
      include: {
        users: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  async getByOrderId(orderId) {
    return await prisma.reviews.findMany({
      where: { order_id: Number(orderId) },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            image_url: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  async getByUserId(userId) {
    return await prisma.reviews.findMany({
      where: { user_id: Number(userId) },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            image_url: true
          }
        },
        orders: {
          select: {
            id: true,
            created_at: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  async update(id, data) {
    return await prisma.reviews.update({
      where: { id: Number(id) },
      data
    });
  },

  async delete(id) {
    await prisma.reviews.delete({ where: { id: Number(id) } });
    return true;
  },

  async exists(userId, productId, orderId) {
    const review = await prisma.reviews.findFirst({
      where: {
        user_id: Number(userId),
        product_id: Number(productId),
        order_id: Number(orderId)
      }
    });
    return !!review;
  },

  async getProductStats(productId) {
    const reviews = await prisma.reviews.findMany({
      where: { product_id: Number(productId) },
      select: { rating: true }
    });

    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length
    };
  },

  async getAllReviews() {
    return await prisma.reviews.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            image_url: true
          }
        },
        orders: {
          select: {
            id: true,
            created_at: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }
};

module.exports = Review; 