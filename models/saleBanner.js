const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const SaleBanner = {
  async getAll() {
    return await prisma.sale_banners.findMany({
      orderBy: { created_at: 'desc' }
    });
  },

  async getActive() {
    const now = new Date();
    return await prisma.sale_banners.findMany({
      where: {
        is_active: true,
        OR: [
          { start_date: null },
          { start_date: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { end_date: null },
              { end_date: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { created_at: 'desc' }
    });
  },

  async getById(id) {
    return await prisma.sale_banners.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    return await prisma.sale_banners.create({ data });
  },

  async update(id, data) {
    return await prisma.sale_banners.update({ where: { id: Number(id) }, data });
  },

  async remove(id) {
    await prisma.sale_banners.delete({ where: { id: Number(id) } });
    return true;
  },

  async setActive(id, is_active) {
    return await prisma.sale_banners.update({
      where: { id: Number(id) },
      data: { is_active }
    });
  }
};

module.exports = SaleBanner; 