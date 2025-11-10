const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create initial admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Created admin user:', { id: admin.id, username: admin.username, role: admin.role });

  // Create sample sales staff user
  const salesPassword = await bcrypt.hash('sales123', 12);
  
  const salesStaff = await prisma.user.upsert({
    where: { username: 'sales_staff' },
    update: {},
    create: {
      username: 'sales_staff',
      password: salesPassword,
      role: 'SALES_STAFF'
    }
  });

  console.log('✅ Created sales staff user:', { id: salesStaff.id, username: salesStaff.username, role: salesStaff.role });

  // Create sample technician user
  const techPassword = await bcrypt.hash('tech123', 12);
  
  const technician = await prisma.user.upsert({
    where: { username: 'technician' },
    update: {},
    create: {
      username: 'technician',
      password: techPassword,
      role: 'TECHNICIAN'
    }
  });

  console.log('✅ Created technician user:', { id: technician.id, username: technician.username, role: technician.role });

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: username=admin, password=admin123');
  console.log('Sales Staff: username=sales_staff, password=sales123');
  console.log('Technician: username=technician, password=tech123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
