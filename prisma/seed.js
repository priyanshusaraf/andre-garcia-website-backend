const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  // Seed admin user
  const adminEmail = 'admin@ag.com';
  const adminPassword = 'admin123';
  const existingAdmin = await prisma.users.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const password_hash = await bcrypt.hash(adminPassword, 10);
    await prisma.users.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password_hash,
        is_admin: true,
      }
    });
    console.log('Admin user created:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }

  await prisma.products.createMany({
    data: [
      {
        name: 'Heritage Cigar Wallet',
        description: 'Classic wallet-style cigar case.',
        price: 4599,
        image_url: 'https://example.com/cigarwallet1.jpg',
        quality: 'Premium',
        size: 'Small',
        stock: 28,
        rating: 4.8,
        reviews: 120,
        badge: 'Best Seller',
        badgeVariant: 'default',
        category: 'Accessories',
        capacity: '3 Cigars',
      },
      {
        name: 'Leather Laptop Bag',
        description: 'Protective laptop bag with leather finish.',
        price: 12499,
        image_url: 'https://example.com/laptopbag1.jpg',
        quality: 'Premium',
        size: 'Medium',
        stock: 22,
        rating: 4.6,
        reviews: 80,
        badge: 'New',
        badgeVariant: 'secondary',
        category: 'Bags',
        capacity: '15" Laptop',
      },
      {
        name: 'Double Cigar Tube',
        description: 'Leather tube for two cigars, travel-friendly.',
        price: 3299,
        image_url: 'https://example.com/cigartube1.jpg',
        quality: 'Standard',
        size: 'Small',
        stock: 40,
        rating: 4.2,
        reviews: 45,
        badge: null,
        badgeVariant: null,
        category: 'Accessories',
        capacity: '2 Cigars',
      },
      {
        name: 'Executive Leather Tote',
        description: 'Spacious tote for business and travel.',
        price: 14999,
        image_url: 'https://example.com/tote1.jpg',
        quality: 'Premium',
        size: 'Large',
        stock: 12,
        rating: 4.9,
        reviews: 60,
        badge: 'Limited Edition',
        badgeVariant: 'secondary',
        category: 'Bags',
        capacity: '20L',
      },
      {
        name: 'Luxury Cigar Holder',
        description: 'Luxury leather cigar holder with cutter pocket.',
        price: 4999,
        image_url: 'https://example.com/cigarholder1.jpg',
        quality: 'Premium',
        size: 'Small',
        stock: 25,
        rating: 4.7,
        reviews: 90,
        badge: null,
        badgeVariant: null,
        category: 'Accessories',
        capacity: '1 Cigar',
      },
      {
        name: 'Compact Leather Satchel',
        description: 'Compact satchel for essentials.',
        price: 7499,
        image_url: 'https://example.com/satchel1.jpg',
        quality: 'Standard',
        size: 'Small',
        stock: 18,
        rating: 4.3,
        reviews: 30,
        badge: null,
        badgeVariant: null,
        category: 'Bags',
        capacity: '5L',
      },
    ]
  });

  // Seed gallery images
  await prisma.gallery_images.createMany({
    data: [
      { image_url: 'https://picsum.photos/seed/artisan1/800/600', title: 'Master Craftsmanship', description: 'Artisan hands carefully shaping premium leather', is_active: true, sort_order: 1 },
      { image_url: 'https://picsum.photos/seed/artisan2/800/600', title: 'Precision Tools', description: 'Traditional tools used in fine leatherwork', is_active: true, sort_order: 2 },
      { image_url: 'https://picsum.photos/seed/artisan3/800/600', title: 'Quality Materials', description: 'Premium leather selection process', is_active: true, sort_order: 3 },
      { image_url: 'https://picsum.photos/seed/artisan4/800/600', title: 'Detailed Stitching', description: 'Hand-stitched seams for lasting durability', is_active: true, sort_order: 4 },
      { image_url: 'https://picsum.photos/seed/artisan5/800/600', title: 'Finishing Touch', description: 'Final polish and quality inspection', is_active: true, sort_order: 5 },
      { image_url: 'https://picsum.photos/seed/artisan6/800/600', title: 'Heritage Workshop', description: 'Our traditional workspace where magic happens', is_active: true, sort_order: 6 },
      { image_url: 'https://picsum.photos/seed/artisan7/800/600', title: 'Time-Honored Techniques', description: 'Techniques passed down through generations', is_active: true, sort_order: 7 },
      { image_url: 'https://picsum.photos/seed/artisan8/800/600', title: 'Attention to Detail', description: 'Every stitch tells a story of dedication', is_active: true, sort_order: 8 }
    ]
  });

  console.log('Gallery images seeded successfully');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  }); 