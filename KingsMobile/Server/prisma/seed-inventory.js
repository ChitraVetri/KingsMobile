const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedInventory() {
  console.log('🌱 Starting inventory seeding...');

  // Sample retail products
  const retailProducts = [
    {
      name: 'iPhone 15 Pro',
      category: 'Mobile Phone',
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      variants: { color: 'Natural Titanium', storage: '128GB' },
      purchasePrice: 85000,
      sellingPrice: 95000,
      gstRate: 18,
      quantity: 10,
      barcode: 'APL15PRO128NT',
      lowStockThreshold: 3
    },
    {
      name: 'Samsung Galaxy S24',
      category: 'Mobile Phone',
      brand: 'Samsung',
      model: 'Galaxy S24',
      variants: { color: 'Phantom Black', storage: '256GB' },
      purchasePrice: 65000,
      sellingPrice: 72000,
      gstRate: 18,
      quantity: 15,
      barcode: 'SAM24256PB',
      lowStockThreshold: 5
    },
    {
      name: 'OnePlus 12',
      category: 'Mobile Phone',
      brand: 'OnePlus',
      model: 'OnePlus 12',
      variants: { color: 'Flowy Emerald', storage: '256GB' },
      purchasePrice: 55000,
      sellingPrice: 62000,
      gstRate: 18,
      quantity: 8,
      barcode: 'OP12256FE',
      lowStockThreshold: 4
    },
    {
      name: 'iPhone Lightning Cable',
      category: 'Accessory',
      brand: 'Apple',
      model: 'Lightning to USB-C',
      variants: { length: '1m', color: 'White' },
      purchasePrice: 1500,
      sellingPrice: 2000,
      gstRate: 18,
      quantity: 50,
      barcode: 'APL1MUSBC',
      lowStockThreshold: 10
    },
    {
      name: 'Samsung Fast Charger',
      category: 'Accessory',
      brand: 'Samsung',
      model: '25W Super Fast Charger',
      variants: { type: 'USB-C', wattage: '25W' },
      purchasePrice: 800,
      sellingPrice: 1200,
      gstRate: 18,
      quantity: 2, // Low stock item
      barcode: 'SAM25WFC',
      lowStockThreshold: 5
    }
  ];

  // Sample repair parts
  const repairParts = [
    {
      name: 'iPhone 15 Pro Display Assembly',
      partNumber: 'IP15PRO-DISP-001',
      compatibleModels: ['iPhone 15 Pro', 'iPhone 15 Pro Max'],
      costPrice: 15000,
      quantity: 5,
      lowStockThreshold: 2
    },
    {
      name: 'Samsung Galaxy S24 Battery',
      partNumber: 'SAM-S24-BAT-001',
      compatibleModels: ['Samsung Galaxy S24', 'Samsung Galaxy S24+'],
      costPrice: 2500,
      quantity: 12,
      lowStockThreshold: 3
    },
    {
      name: 'Universal USB-C Charging Port',
      partNumber: 'UNIV-USBC-PORT-001',
      compatibleModels: ['OnePlus 12', 'Samsung Galaxy S24', 'Google Pixel 8'],
      costPrice: 800,
      quantity: 1, // Low stock item
      lowStockThreshold: 3
    },
    {
      name: 'iPhone Lightning Connector',
      partNumber: 'IP-LIGHT-CONN-001',
      compatibleModels: ['iPhone 14', 'iPhone 13', 'iPhone 12'],
      costPrice: 1200,
      quantity: 8,
      lowStockThreshold: 2
    },
    {
      name: 'Generic Phone Screen Protector',
      partNumber: 'GEN-SCRN-PROT-001',
      compatibleModels: ['Universal'],
      costPrice: 50,
      quantity: 100,
      lowStockThreshold: 20
    }
  ];

  // Create retail products
  console.log('📱 Creating retail products...');
  for (const productData of retailProducts) {
    const product = await prisma.retailProduct.upsert({
      where: { barcode: productData.barcode },
      update: {},
      create: {
        ...productData,
        variants: JSON.stringify(productData.variants)
      }
    });
    console.log(`✅ Created retail product: ${product.name}`);
  }

  // Create repair parts
  console.log('🔧 Creating repair parts...');
  for (const partData of repairParts) {
    const part = await prisma.repairPart.upsert({
      where: { partNumber: partData.partNumber },
      update: {},
      create: {
        ...partData,
        compatibleModels: JSON.stringify(partData.compatibleModels)
      }
    });
    console.log(`✅ Created repair part: ${part.name}`);
  }

  console.log('🎉 Inventory seeding completed!');
  console.log('\n📊 Inventory Summary:');
  console.log(`📱 Retail Products: ${retailProducts.length}`);
  console.log(`🔧 Repair Parts: ${repairParts.length}`);
  console.log('\n⚠️  Note: Some items have low stock for testing low-stock alerts');
}

seedInventory()
  .catch((e) => {
    console.error('❌ Inventory seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
