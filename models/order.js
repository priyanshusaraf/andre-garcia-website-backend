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
    const order = await prisma.orders.create({
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
  },
  async updateStatus(id, status) {
    return await prisma.orders.update({ where: { id: Number(id) }, data: { status } });
  }
};

module.exports = Order; 