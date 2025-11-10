const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedRepairs() {
  console.log('🌱 Starting repair data seeding...');

  // Get existing customers or create sample ones
  const customers = await prisma.customer.findMany();
  
  let sampleCustomers = [];
  
  if (customers.length === 0) {
    console.log('📞 Creating sample customers...');
    
    const customerData = [
      { name: 'John Doe', phone: '+91-9876543210' },
      { name: 'Jane Smith', phone: '+91-9876543211' },
      { name: 'Mike Johnson', phone: '+91-9876543212' }
    ];

    for (const customerInfo of customerData) {
      const customer = await prisma.customer.create({
        data: customerInfo
      });
      sampleCustomers.push(customer);
      console.log(`✅ Created customer: ${customer.name}`);
    }
  } else {
    sampleCustomers = customers.slice(0, 3);
    console.log(`📞 Using existing customers: ${sampleCustomers.length}`);
  }

  // Get technician user
  const technician = await prisma.user.findFirst({
    where: { role: 'TECHNICIAN' }
  });

  if (!technician) {
    console.log('❌ No technician found. Please run user seed first.');
    return;
  }

  // Sample repair jobs
  const repairJobsData = [
    {
      customerId: sampleCustomers[0].id,
      deviceInfo: 'iPhone 15 Pro - Natural Titanium 128GB',
      reportedIssue: 'Screen is cracked and touch is not responding properly. Phone was dropped from height.',
      status: 'COMPLETED',
      technicianId: technician.id,
      laborCost: 2000,
      totalCost: 17000 // Will be recalculated with parts
    },
    {
      customerId: sampleCustomers[1].id,
      deviceInfo: 'Samsung Galaxy S24 - Phantom Black 256GB',
      reportedIssue: 'Battery drains very quickly, phone shuts down at 20% battery. Issue started after software update.',
      status: 'IN_PROGRESS',
      technicianId: technician.id,
      laborCost: 0,
      totalCost: 0
    },
    {
      customerId: sampleCustomers[2].id,
      deviceInfo: 'OnePlus 12 - Flowy Emerald 256GB',
      reportedIssue: 'Charging port is loose, cable keeps disconnecting. Sometimes phone does not charge at all.',
      status: 'RECEIVED',
      laborCost: 0,
      totalCost: 0
    }
  ];

  console.log('🔧 Creating repair jobs...');
  const createdJobs = [];

  for (const jobData of repairJobsData) {
    const repairJob = await prisma.repairJob.create({
      data: jobData,
      include: {
        customer: true
      }
    });
    createdJobs.push(repairJob);
    console.log(`✅ Created repair job: ${repairJob.id} for ${repairJob.customer.name}`);
  }

  // Add parts usage to the completed job
  console.log('🔩 Adding parts usage to completed repair job...');
  
  // Get some repair parts
  const displayPart = await prisma.repairPart.findFirst({
    where: { name: { contains: 'Display' } }
  });

  if (displayPart && createdJobs[0]) {
    // Add display part to the completed iPhone repair
    await prisma.repairPartUsage.create({
      data: {
        repairJobId: createdJobs[0].id,
        repairPartId: displayPart.id,
        quantityUsed: 1
      }
    });

    // Update repair part stock (simulate the deduction)
    await prisma.repairPart.update({
      where: { id: displayPart.id },
      data: {
        quantity: {
          decrement: 1
        }
      }
    });

    // Update total cost of the repair job
    const partsCost = displayPart.costPrice * 1;
    const totalCost = partsCost + createdJobs[0].laborCost;
    
    await prisma.repairJob.update({
      where: { id: createdJobs[0].id },
      data: { totalCost }
    });

    console.log(`✅ Added ${displayPart.name} to repair job ${createdJobs[0].id}`);
  }

  console.log('🎉 Repair data seeding completed!');
  console.log('\n📊 Repair Summary:');
  console.log(`👥 Customers: ${sampleCustomers.length}`);
  console.log(`🔧 Repair Jobs: ${createdJobs.length}`);
  console.log('   - 1 Completed (with parts usage)');
  console.log('   - 1 In Progress');
  console.log('   - 1 Received');
}

seedRepairs()
  .catch((e) => {
    console.error('❌ Repair seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
