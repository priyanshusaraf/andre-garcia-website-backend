const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const User = {
  async getByEmail(email) {
    return await prisma.users.findUnique({ where: { email } });
  },
  async getById(id) {
    return await prisma.users.findUnique({ where: { id: Number(id) } });
  },
  async create(data) {
    return await prisma.users.create({ data });
  },
  async update(id, data) {
    return await prisma.users.update({ where: { id: Number(id) }, data });
  },
  async remove(id) {
    const userId = Number(id);
    
    // Check if user exists and has orders
    const userWithOrders = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!userWithOrders) {
      throw new Error('User not found');
    }

    // If user has orders, we cannot delete due to foreign key constraints
    if (userWithOrders._count.orders > 0) {
      throw new Error(`Cannot delete user: User has ${userWithOrders._count.orders} existing orders. Delete orders first or this will violate database constraints.`);
    }

    // Safe to delete - no foreign key constraints will be violated
    await prisma.users.delete({ where: { id: userId } });
    return true;
  },
  async getNotifications(user_id) {
    return await prisma.notifications.findMany({
      where: { user_id: Number(user_id) },
      orderBy: { created_at: 'desc' }
    });
  }
};

module.exports = User; 