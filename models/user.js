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
    await prisma.users.delete({ where: { id: Number(id) } });
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