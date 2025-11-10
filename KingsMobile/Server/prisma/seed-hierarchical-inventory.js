const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHierarchicalInventory() {
  console.log('🌱 Starting hierarchical inventory seeding...');

  try {
    // Step 1: Create default location
    console.log('📍 Creating default location...');
    const defaultLocation = await prisma.location.upsert({
      where: { name: 'Main Store' },
      update: {},
      create: {
        name: 'Main Store',
        address: '123 Main Street, City, State',
        type: 'STORE',
        isActive: true
      }
    });

    console.log(`✅ Created location: ${defaultLocation.name}`);

    // Step 2: Create sample products with variants
    console.log('📱 Creating sample products and variants...');
    
    // iPhone 15 Pro
    const iphone15Pro = await prisma.product.upsert({
      where: { 
        name_brand_model: { 
          name: 'iPhone 15 Pro', 
          brand: 'Apple', 
          model: 'A3108' 
        } 
      },
      update: {},
      create: {
        name: 'iPhone 15 Pro',
        category: 'Mobile Phone',
        brand: 'Apple',
        model: 'A3108',
        description: 'Latest iPhone with titanium design and advanced camera system',
        productType: 'MOBILE_PHONE',
        isActive: true
      }
    });

    // Create variants for iPhone 15 Pro
    const iphone15ProVariants = [
      {
        color: 'Natural Titanium',
        storage: '128GB',
        carrier: 'Unlocked',
        sku: 'IP15P-NT-128-UL',
        purchasePrice: 85000,
        sellingPrice: 99900
      },
      {
        color: 'Natural Titanium',
        storage: '256GB',
        carrier: 'Unlocked',
        sku: 'IP15P-NT-256-UL',
        purchasePrice: 95000,
        sellingPrice: 109900
      },
      {
        color: 'Blue Titanium',
        storage: '128GB',
        carrier: 'Unlocked',
        sku: 'IP15P-BT-128-UL',
        purchasePrice: 85000,
        sellingPrice: 99900
      }
    ];

    for (const variantData of iphone15ProVariants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: variantData.sku },
        update: {},
        create: {
          ...variantData,
          productId: iphone15Pro.id,
          gstRate: 18,
          lowStockThreshold: 5
        }
      });

      // Create location stock for this variant
      await prisma.locationStock.upsert({
        where: {
          variantId_locationId: {
            variantId: variant.id,
            locationId: defaultLocation.id
          }
        },
        update: {},
        create: {
          variantId: variant.id,
          locationId: defaultLocation.id,
          quantity: 10,
          reservedQuantity: 0,
          availableQuantity: 10
        }
      });

      // Create some serialized items for this variant
      for (let i = 1; i <= 3; i++) {
        const serializedItem = await prisma.serializedItem.create({
          data: {
            variantId: variant.id,
            serialNumber: `${variantData.sku}-${String(i).padStart(3, '0')}`,
            imei: `35${Math.random().toString().substr(2, 13)}`, // Generate fake IMEI
            condition: 'NEW',
            status: 'IN_STOCK',
            locationId: defaultLocation.id,
            notes: 'Initial inventory'
          }
        });

        // Create history entry for receiving this item
        await prisma.deviceHistory.create({
          data: {
            serializedItemId: serializedItem.id,
            event: 'RECEIVED',
            description: 'Initial inventory - received from supplier',
            toLocationId: defaultLocation.id,
            userId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id || 'system',
            metadata: {
              supplier: 'Apple Inc.',
              purchaseOrder: 'PO-2024-001'
            }
          }
        });
      }

      console.log(`✅ Created variant: ${variantData.sku} with 3 serialized items`);
    }

    // Samsung Galaxy S24
    const galaxyS24 = await prisma.product.upsert({
      where: { 
        name_brand_model: { 
          name: 'Galaxy S24', 
          brand: 'Samsung', 
          model: 'SM-S921B' 
        } 
      },
      update: {},
      create: {
        name: 'Galaxy S24',
        category: 'Mobile Phone',
        brand: 'Samsung',
        model: 'SM-S921B',
        description: 'Samsung flagship with advanced AI features',
        productType: 'MOBILE_PHONE',
        isActive: true
      }
    });

    // Create variants for Galaxy S24
    const galaxyS24Variants = [
      {
        color: 'Onyx Black',
        storage: '128GB',
        carrier: 'Unlocked',
        sku: 'GS24-OB-128-UL',
        purchasePrice: 65000,
        sellingPrice: 79900
      },
      {
        color: 'Marble Gray',
        storage: '256GB',
        carrier: 'Unlocked',
        sku: 'GS24-MG-256-UL',
        purchasePrice: 75000,
        sellingPrice: 89900
      }
    ];

    for (const variantData of galaxyS24Variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: variantData.sku },
        update: {},
        create: {
          ...variantData,
          productId: galaxyS24.id,
          gstRate: 18,
          lowStockThreshold: 5
        }
      });

      // Create location stock
      await prisma.locationStock.upsert({
        where: {
          variantId_locationId: {
            variantId: variant.id,
            locationId: defaultLocation.id
          }
        },
        update: {},
        create: {
          variantId: variant.id,
          locationId: defaultLocation.id,
          quantity: 8,
          reservedQuantity: 0,
          availableQuantity: 8
        }
      });

      // Create serialized items
      for (let i = 1; i <= 2; i++) {
        const serializedItem = await prisma.serializedItem.create({
          data: {
            variantId: variant.id,
            serialNumber: `${variantData.sku}-${String(i).padStart(3, '0')}`,
            imei: `35${Math.random().toString().substr(2, 13)}`,
            condition: 'NEW',
            status: 'IN_STOCK',
            locationId: defaultLocation.id,
            notes: 'Initial inventory'
          }
        });

        // Create history entry
        await prisma.deviceHistory.create({
          data: {
            serializedItemId: serializedItem.id,
            event: 'RECEIVED',
            description: 'Initial inventory - received from supplier',
            toLocationId: defaultLocation.id,
            userId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id || 'system',
            metadata: {
              supplier: 'Samsung Electronics',
              purchaseOrder: 'PO-2024-002'
            }
          }
        });
      }

      console.log(`✅ Created variant: ${variantData.sku} with 2 serialized items`);
    }

    // Create additional locations
    console.log('🏪 Creating additional locations...');
    
    const warehouse = await prisma.location.upsert({
      where: { name: 'Central Warehouse' },
      update: {},
      create: {
        name: 'Central Warehouse',
        address: '456 Industrial Blvd, City, State',
        type: 'WAREHOUSE',
        isActive: true
      }
    });

    const repairCenter = await prisma.location.upsert({
      where: { name: 'Repair Center' },
      update: {},
      create: {
        name: 'Repair Center',
        address: '789 Service Road, City, State',
        type: 'REPAIR_CENTER',
        isActive: true
      }
    });

    console.log(`✅ Created additional locations: ${warehouse.name}, ${repairCenter.name}`);

    console.log('✅ Hierarchical inventory seeding completed successfully!');
    
    // Print summary
    const [locationCount, productCount, variantCount, serializedCount, stockCount, historyCount] = await Promise.all([
      prisma.location.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.serializedItem.count(),
      prisma.locationStock.count(),
      prisma.deviceHistory.count()
    ]);

    console.log('\n📊 Hierarchical Inventory Summary:');
    console.log(`📍 Locations: ${locationCount}`);
    console.log(`📱 Products: ${productCount}`);
    console.log(`🎨 Product Variants: ${variantCount}`);
    console.log(`🔢 Serialized Items: ${serializedCount}`);
    console.log(`📦 Location Stocks: ${stockCount}`);
    console.log(`📋 Device History Records: ${historyCount}`);

  } catch (error) {
    console.error('❌ Error seeding hierarchical inventory:', error);
    throw error;
  }
}

// Run the seed function
seedHierarchicalInventory()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
