const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const Product = {
  async getAll() {
    return await prisma.products.findMany();
  },
  async getById(id) {
    return await prisma.products.findUnique({ where: { id: Number(id) } });
  },
  async create(data) {
    return await prisma.products.create({ data });
  },
  async update(id, data) {
    return await prisma.products.update({ where: { id: Number(id) }, data });
  },
  async remove(id) {
    await prisma.products.delete({ where: { id: Number(id) } });
    return true;
  }
};

module.exports = Product; 