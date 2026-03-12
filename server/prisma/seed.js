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
      name: 'Orange Admin',
      email: 'admin@orange.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create one Customer
  const customer = await prisma.customer.create({
    data: { 
      name: 'Balu Test', 
      phone: '9876543210', 
      email: 'balu.test@example.com', 
      address: 'Shop 1, Main Street' 
    },
  });
  console.log('✅ 1 customer created');

  // Create one Product
  const product = await prisma.product.create({
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
  console.log('✅ 1 product created');

  // Create one Spare Part
  const part = await prisma.sparePart.create({
    data: { 
      name: 'iPhone 15 Screen', 
      category: 'screen', 
      costPrice: 8500, 
      stock: 2, 
      minStock: 1 
    } 
  });
  console.log('✅ 1 spare part created');

  console.log('\n🎉 Fresh seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin: admin@orange.com / admin123\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
