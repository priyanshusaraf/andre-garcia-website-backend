const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const Product = {
  async getAll() {
    return await prisma.products.findMany({
      orderBy: { created_at: 'desc' }
    });
  },
  
  async getFeatured() {
    return await prisma.products.findMany({
      where: { is_featured: true },
      orderBy: { created_at: 'desc' }
    });
  },

  async getOnSale() {
    const now = new Date();
    return await prisma.products.findMany({
      where: {
        on_sale: true,
        OR: [
          { sale_start_date: null },
          { sale_start_date: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { sale_end_date: null },
              { sale_end_date: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { created_at: 'desc' }
    });
  },

  async getById(id) {
    return await prisma.products.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    // Clean and ensure numeric fields are properly converted
    const productData = {
      name: data.name || '',
      description: data.description || null,
      price: parseFloat(data.price) || 0,
      image_url: data.image_url || null,
      quality: data.quality || null,
      size: data.size || null,
      stock: data.stock ? parseInt(data.stock) : 0,
      rating: data.rating ? parseFloat(data.rating) : 0,
      reviews: data.reviews ? parseInt(data.reviews) : 0,
      badge: data.badge || null,
      badgeVariant: data.badgeVariant || null,
      category: data.category || null,
      capacity: data.capacity || null
    };

    // Only include optional fields if they have actual values
    if (data.discount_percent && parseFloat(data.discount_percent) > 0) {
      productData.discount_percent = parseFloat(data.discount_percent);
      productData.sale_price = productData.price * (1 - productData.discount_percent / 100);
    }

    console.log('Processed product data for creation:', productData);
    
    return await prisma.products.create({ data: productData });
  },

  async update(id, data) {
    // Calculate sale_price if discount_percent is provided
    if (data.discount_percent && data.price) {
      data.sale_price = data.price * (1 - data.discount_percent / 100);
    }
    return await prisma.products.update({ where: { id: Number(id) }, data });
  },

  async remove(id) {
    await prisma.products.delete({ where: { id: Number(id) } });
    return true;
  },

  async setFeatured(id, is_featured) {
    return await prisma.products.update({
      where: { id: Number(id) },
      data: { is_featured }
    });
  },

  async setNew(id, is_new) {
    return await prisma.products.update({
      where: { id: Number(id) },
      data: { is_new }
    });
  },

  async setSale(id, saleData) {
    const { discount_percent, sale_start_date, sale_end_date, on_sale } = saleData;
    const product = await this.getById(id);
    
    const updateData = {
      discount_percent,
      sale_start_date,
      sale_end_date,
      on_sale
    };

    // Calculate sale_price if discount_percent is provided
    if (discount_percent && product.price) {
      updateData.sale_price = product.price * (1 - discount_percent / 100);
    }

    return await prisma.products.update({
      where: { id: Number(id) },
      data: updateData
    });
  }
};

module.exports = Product; 