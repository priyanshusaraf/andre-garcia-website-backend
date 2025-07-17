const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const AdminSettings = {
  async get(key) {
    const setting = await prisma.admin_settings.findUnique({ where: { key } });
    return setting?.value || null;
  },

  async set(key, value) {
    return await prisma.admin_settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  },

  async getAll() {
    return await prisma.admin_settings.findMany();
  },

  async remove(key) {
    await prisma.admin_settings.delete({ where: { key } });
    return true;
  }
};

module.exports = AdminSettings; 