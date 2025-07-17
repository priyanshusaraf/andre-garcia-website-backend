const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const Order = {
  async getByUserId(user_id) {
    return await prisma.orders.findMany({
      where: { user_id: Number(user_id) },
      include: { order_items: { include: { products: true } } }
    });
  },
  async getById(id) {
    return await prisma.orders.findUnique({
      where: { id: Number(id) },
      include: { order_items: { include: { products: true } } }
    });
  },
  async create(user_id, items, total_amount) {
    // items: [{ product_id, quantity, price_at_purchase }]
    return await prisma.$transaction(async (tx) => {
      // Check stock for all items
      for (const item of items) {
        const product = await tx.products.findUnique({ where: { id: Number(item.product_id) } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ID ${item.product_id}`);
        }
      }
      // Decrement stock
      for (const item of items) {
        await tx.products.update({
          where: { id: Number(item.product_id) },
          data: { stock: { decrement: item.quantity } }
        });
      }
      // Create order
      const order = await tx.orders.create({
        data: {
          user_id: Number(user_id),
          total_amount,
          order_items: {
            create: items.map(item => ({
              product_id: Number(item.product_id),
              quantity: item.quantity,
              price_at_purchase: item.price_at_purchase
            }))
          }
        },
        include: { order_items: true }
      });
      // TODO: Notify admin (placeholder)
      return order;
    });
  },
  async updateStatus(id, status) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({
        where: { id: Number(id) },
        include: { order_items: true }
      });
      if (!order) throw new Error('Order not found');
      // If cancelling, restore stock
      if (status === 'cancelled') {
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.product_id },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
      // Update order status
      const updatedOrder = await tx.orders.update({
        where: { id: Number(id) },
        data: { status }
      });
      // Create notification for user
      if (status === 'delivered' || status === 'cancelled') {
        await tx.notifications.create({
          data: {
            user_id: order.user_id,
            message: status === 'delivered' ? 'Your order has been accepted!' : 'Your order was cancelled.',
            read: false
          }
        });
      }
      return updatedOrder;
    });
  }
};

module.exports = Order; 