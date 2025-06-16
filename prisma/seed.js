const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.products.createMany({
    data: [
      {
        name: 'Heritage Cigar Wallet',
        description: 'Classic wallet-style cigar case.',
        price: 54.99,
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
        price: 149.99,
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
        price: 39.99,
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
        price: 179.99,
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
        price: 59.99,
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
        price: 89.99,
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
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  }); 