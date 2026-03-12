const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.inventoryAlert.deleteMany();
  await prisma.repairPart.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.secondHandSale.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.secondHandIntake.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.product.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@antigravity.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Staff user
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.create({
    data: {
      name: 'Staff User',
      email: 'staff@antigravity.com',
      password: staffPassword,
      role: 'STAFF',
    },
  });
  console.log('✅ Staff user created:', staff.email);

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com', address: 'Shop 12, Main Market, Delhi' },
    }),
    prisma.customer.create({
      data: { name: 'Priya Patel', phone: '9876543211', email: 'priya@example.com', address: '45 Green Street, Mumbai' },
    }),
    prisma.customer.create({
      data: { name: 'Vikram Singh', phone: '9876543212', email: 'vikram@example.com', address: '8 Lake Road, Bangalore' },
    }),
  ]);
  console.log(`✅ ${customers.length} customers created`);

  // Create Products (New Phones)
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        model: 'A3106',
        costPrice: 125000,
        sellingPrice: 159900,
        stock: 8,
        minStock: 3,
        specs: { ram: '8GB', storage: '256GB', color: 'Natural Titanium' },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        model: 'SM-S928B',
        costPrice: 105000,
        sellingPrice: 134999,
        stock: 12,
        minStock: 5,
        specs: { ram: '12GB', storage: '256GB', color: 'Titanium Gray' },
      },
    }),
    prisma.product.create({
      data: {
        name: 'OnePlus 12',
        brand: 'OnePlus',
        model: 'CPH2583',
        costPrice: 52000,
        sellingPrice: 64999,
        stock: 15,
        minStock: 5,
        specs: { ram: '12GB', storage: '256GB', color: 'Silky Black' },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Google Pixel 8 Pro',
        brand: 'Google',
        model: 'GC3VE',
        costPrice: 78000,
        sellingPrice: 106999,
        stock: 2,
        minStock: 3,
        specs: { ram: '12GB', storage: '128GB', color: 'Obsidian' },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Realme GT 5 Pro',
        brand: 'Realme',
        model: 'RMX3888',
        costPrice: 28000,
        sellingPrice: 37999,
        stock: 20,
        minStock: 5,
        specs: { ram: '8GB', storage: '128GB', color: 'Submarine Blue' },
      },
    }),
  ]);
  console.log(`✅ ${products.length} products created`);

  // Create Spare Parts
  const parts = await Promise.all([
    prisma.sparePart.create({ data: { name: 'iPhone 15 Screen Assembly', category: 'screen', costPrice: 8500, stock: 5, minStock: 2, supplier: 'MobileParts India' } }),
    prisma.sparePart.create({ data: { name: 'Samsung S24 Battery', category: 'battery', costPrice: 2800, stock: 10, minStock: 3, supplier: 'BatteryWorld' } }),
    prisma.sparePart.create({ data: { name: 'Type-C Charging Port', category: 'charging_port', costPrice: 450, stock: 25, minStock: 5, supplier: 'SpareHub' } }),
    prisma.sparePart.create({ data: { name: 'iPhone Back Glass', category: 'back_panel', costPrice: 3200, stock: 4, minStock: 2, supplier: 'MobileParts India' } }),
    prisma.sparePart.create({ data: { name: 'Universal Screen Protector', category: 'accessories', costPrice: 50, stock: 100, minStock: 20, supplier: 'AccessoryMart' } }),
  ]);
  console.log(`✅ ${parts.length} spare parts created`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin: admin@antigravity.com / admin123');
  console.log('  Staff: staff@antigravity.com / staff123\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
