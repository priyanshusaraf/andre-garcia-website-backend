const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const Cart = {
  async getByUserId(user_id) {
    return await prisma.carts.findFirst({
      where: { user_id: Number(user_id) },
      include: { cart_items: { include: { products: true } } }
    });
  },
  async create(user_id) {
    return await prisma.carts.create({ data: { user_id: Number(user_id) } });
  },
  async addItem(cart_id, product_id, quantity) {
    return await prisma.cart_items.create({
      data: { cart_id: Number(cart_id), product_id: Number(product_id), quantity }
    });
  },
  async updateItem(item_id, quantity) {
    return await prisma.cart_items.update({
      where: { id: Number(item_id) },
      data: { quantity }
    });
  },
  async removeItem(item_id) {
    await prisma.cart_items.delete({ where: { id: Number(item_id) } });
    return true;
  },
  async clearCart(cart_id) {
    await prisma.cart_items.deleteMany({ where: { cart_id: Number(cart_id) } });
    return true;
  },
  async getOrCreateByUserId(user_id) {
    let cart = await prisma.carts.findFirst({ where: { user_id: Number(user_id) } });
    if (!cart) {
      cart = await prisma.carts.create({ data: { user_id: Number(user_id) } });
    }
    return cart;
  },
  async getById(cart_id) {
    return await prisma.carts.findUnique({
      where: { id: Number(cart_id) },
      include: { cart_items: { include: { products: true } } }
    });
  }
};

module.exports = Cart; 