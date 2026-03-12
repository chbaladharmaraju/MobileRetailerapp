const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data in reverse order of dependencies
  console.log('🧹 Cleaning existing data...');
  await prisma.inventoryAlert.deleteMany();
  await prisma.repairPart.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.secondHandSale.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.secondHandIntake.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.inventoryPurchase.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.distributorTransaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  console.log('✨ Database is clean.');

  // Create Admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Orange Admin',
      email: 'admin@orange.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create one Customer
  console.log('👥 Creating one customer...');
  await prisma.customer.create({
    data: { 
      name: 'Balu Test', 
      phone: '9876543210', 
      email: 'balu.test@example.com', 
      address: 'Shop 1, Main Street' 
    },
  });

  // Create one Product
  console.log('📱 Creating one product...');
  await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      model: 'A3106',
      costPrice: 95000,
      sellingPrice: 120000,
      stock: 5,
      minStock: 2,
      specs: { ram: '8GB', storage: '128GB', color: 'Black' },
    },
  });

  // Create one Spare Part
  console.log('🔧 Creating one spare part...');
  await prisma.sparePart.create({
    data: { 
      name: 'iPhone 15 Screen', 
      category: 'screen', 
      costPrice: 8500, 
      stock: 2, 
      minStock: 1 
    } 
  });

  console.log('\n🎉 Fresh seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin: admin@orange.com / admin123\n');
}

seed()
  .catch((e) => {
    console.error('❌ SEEDING FAILED AT STEP:', e.meta?.target || 'unknown');
    console.error('❌ ERROR DETAILS:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
