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
  async updateStatus(id, status, trackingNumber = null) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({
        where: { id: Number(id) },
        include: { order_items: true }
      });
      if (!order) throw new Error('Order not found');
      
      // If rejecting, restore stock
      if (status === 'rejected') {
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.product_id },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
      
      // Prepare update data
      const updateData = { status };
      if (trackingNumber && status === 'in_transit') {
        updateData.tracking_number = trackingNumber;
      }
      
      // Update order status
      const updatedOrder = await tx.orders.update({
        where: { id: Number(id) },
        data: updateData,
        include: { order_items: { include: { products: true } } }
      });
      
      // Create notification for user
      let notificationMessage = '';
      switch (status) {
        case 'in_transit':
          notificationMessage = `Your order #${id} is now in transit!${trackingNumber ? ` Tracking number: ${trackingNumber}` : ''}`;
          break;
        case 'completed':
          notificationMessage = `Your order #${id} has been completed!`;
          break;
        case 'rejected':
          notificationMessage = `Your order #${id} has been rejected. Please contact support for more information.`;
          break;
        case 'confirmed':
          notificationMessage = `Your order #${id} has been confirmed and is being processed!`;
          break;
      }
      
      if (notificationMessage) {
        try {
          await tx.notifications.create({
            data: {
              user_id: order.user_id,
              message: notificationMessage,
              read: false
            }
          });
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
          // Don't fail the entire transaction for notification errors
        }
      }
      
      return updatedOrder;
    });
  },

  async getOrderItems(orderId) {
    return await prisma.order_items.findMany({
      where: { order_id: Number(orderId) },
      include: { products: true }
    });
  }
};

module.exports = Order; 