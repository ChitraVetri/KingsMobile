const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMasterData() {
  console.log('🌱 Starting master data seeding...');

  try {
    // Seed Categories
    console.log('📱 Creating categories...');
    const categories = [
      { name: 'Mobile Phone', description: 'Smartphones and feature phones' },
      { name: 'Tablet', description: 'iPad, Android tablets, etc.' },
      { name: 'Accessory', description: 'Phone accessories and add-ons' },
      { name: 'Case', description: 'Protective cases and covers' },
      { name: 'Charger', description: 'Charging cables and adapters' },
      { name: 'Screen Protector', description: 'Tempered glass and screen films' },
      { name: 'Earphones', description: 'Wired and wireless earphones' },
      { name: 'Power Bank', description: 'Portable charging devices' }
    ];

    for (const category of categories) {
      await prisma.masterCategory.upsert({
        where: { name: category.name },
        update: {},
        create: category
      });
    }

    // Seed Brands
    console.log('🏷️ Creating brands...');
    const brands = [
      { name: 'Apple', description: 'iPhone, iPad, MacBook, etc.' },
      { name: 'Samsung', description: 'Galaxy series smartphones and tablets' },
      { name: 'OnePlus', description: 'Premium Android smartphones' },
      { name: 'Xiaomi', description: 'Mi and Redmi series phones' },
      { name: 'Oppo', description: 'Camera-focused smartphones' },
      { name: 'Vivo', description: 'Stylish smartphones with great cameras' },
      { name: 'Realme', description: 'Youth-focused smartphone brand' },
      { name: 'Google', description: 'Pixel smartphones' },
      { name: 'Huawei', description: 'Premium smartphones and tablets' },
      { name: 'Honor', description: 'Performance-oriented smartphones' },
      { name: 'Motorola', description: 'Moto series smartphones' },
      { name: 'Nokia', description: 'Reliable smartphones' }
    ];

    const createdBrands = {};
    for (const brand of brands) {
      const createdBrand = await prisma.masterBrand.upsert({
        where: { name: brand.name },
        update: {},
        create: brand
      });
      createdBrands[brand.name] = createdBrand;
    }

    // Seed Models
    console.log('📱 Creating models...');
    const models = [
      // Apple Models
      { name: 'iPhone 15 Pro Max', brandName: 'Apple' },
      { name: 'iPhone 15 Pro', brandName: 'Apple' },
      { name: 'iPhone 15 Plus', brandName: 'Apple' },
      { name: 'iPhone 15', brandName: 'Apple' },
      { name: 'iPhone 14 Pro Max', brandName: 'Apple' },
      { name: 'iPhone 14 Pro', brandName: 'Apple' },
      { name: 'iPhone 14 Plus', brandName: 'Apple' },
      { name: 'iPhone 14', brandName: 'Apple' },
      { name: 'iPhone 13', brandName: 'Apple' },
      { name: 'iPhone 12', brandName: 'Apple' },
      { name: 'iPad Pro 12.9"', brandName: 'Apple' },
      { name: 'iPad Air', brandName: 'Apple' },

      // Samsung Models
      { name: 'Galaxy S24 Ultra', brandName: 'Samsung' },
      { name: 'Galaxy S24+', brandName: 'Samsung' },
      { name: 'Galaxy S24', brandName: 'Samsung' },
      { name: 'Galaxy S23 Ultra', brandName: 'Samsung' },
      { name: 'Galaxy S23+', brandName: 'Samsung' },
      { name: 'Galaxy S23', brandName: 'Samsung' },
      { name: 'Galaxy A54', brandName: 'Samsung' },
      { name: 'Galaxy A34', brandName: 'Samsung' },
      { name: 'Galaxy M34', brandName: 'Samsung' },

      // OnePlus Models
      { name: 'OnePlus 12', brandName: 'OnePlus' },
      { name: 'OnePlus 11', brandName: 'OnePlus' },
      { name: 'OnePlus Nord 3', brandName: 'OnePlus' },
      { name: 'OnePlus Nord CE 3', brandName: 'OnePlus' },

      // Xiaomi Models
      { name: 'Xiaomi 14', brandName: 'Xiaomi' },
      { name: 'Xiaomi 13', brandName: 'Xiaomi' },
      { name: 'Redmi Note 13 Pro', brandName: 'Xiaomi' },
      { name: 'Redmi Note 13', brandName: 'Xiaomi' },
      { name: 'Redmi 13C', brandName: 'Xiaomi' }
    ];

    for (const model of models) {
      const brand = createdBrands[model.brandName];
      if (brand) {
        await prisma.masterModel.upsert({
          where: { 
            name_brandId: { 
              name: model.name, 
              brandId: brand.id 
            } 
          },
          update: {},
          create: {
            name: model.name,
            brandId: brand.id,
            description: `${model.brandName} ${model.name}`
          }
        });
      }
    }

    // Seed Product Names
    console.log('📦 Creating product names...');
    const productNames = [
      { name: 'iPhone 15 Pro Max', description: 'Latest flagship iPhone with titanium design' },
      { name: 'iPhone 15 Pro', description: 'Pro iPhone with advanced camera system' },
      { name: 'iPhone 15', description: 'Standard iPhone with USB-C' },
      { name: 'iPhone 14 Pro', description: 'Previous generation Pro iPhone' },
      { name: 'iPhone 14', description: 'Previous generation standard iPhone' },
      { name: 'Galaxy S24 Ultra', description: 'Samsung flagship with S Pen' },
      { name: 'Galaxy S24', description: 'Samsung flagship smartphone' },
      { name: 'Galaxy A54', description: 'Mid-range Samsung smartphone' },
      { name: 'OnePlus 12', description: 'Latest OnePlus flagship' },
      { name: 'OnePlus 11', description: 'Previous OnePlus flagship' },
      { name: 'Xiaomi 14', description: 'Latest Xiaomi flagship' },
      { name: 'Redmi Note 13 Pro', description: 'Mid-range Redmi smartphone' },
      { name: 'iPad Pro 12.9"', description: 'Large professional tablet' },
      { name: 'iPad Air', description: 'Mid-range iPad' },
      { name: 'Galaxy Tab S9', description: 'Samsung premium tablet' }
    ];

    for (const productName of productNames) {
      await prisma.masterProductName.upsert({
        where: { name: productName.name },
        update: {},
        create: productName
      });
    }

    // Seed Part Names
    console.log('🔧 Creating part names...');
    const partNames = [
      { name: 'Display Assembly', description: 'Complete screen with touch digitizer' },
      { name: 'LCD Screen', description: 'LCD display panel' },
      { name: 'OLED Screen', description: 'OLED display panel' },
      { name: 'Touch Digitizer', description: 'Touch sensor layer' },
      { name: 'Battery', description: 'Lithium-ion battery' },
      { name: 'Charging Port', description: 'USB-C or Lightning charging port' },
      { name: 'Speaker', description: 'Internal speaker component' },
      { name: 'Microphone', description: 'Internal microphone' },
      { name: 'Camera Module', description: 'Rear camera assembly' },
      { name: 'Front Camera', description: 'Selfie camera module' },
      { name: 'Home Button', description: 'Physical home button' },
      { name: 'Power Button', description: 'Power/sleep button' },
      { name: 'Volume Button', description: 'Volume up/down buttons' },
      { name: 'SIM Tray', description: 'SIM card tray' },
      { name: 'Back Cover', description: 'Rear panel/back glass' },
      { name: 'Frame', description: 'Metal frame/chassis' },
      { name: 'Flex Cable', description: 'Internal connecting cables' },
      { name: 'Antenna', description: 'Signal reception antenna' },
      { name: 'Vibrator Motor', description: 'Haptic feedback motor' },
      { name: 'Proximity Sensor', description: 'Proximity detection sensor' }
    ];

    for (const partName of partNames) {
      await prisma.masterPartName.upsert({
        where: { name: partName.name },
        update: {},
        create: partName
      });
    }

    console.log('✅ Master data seeding completed successfully!');
    
    // Print summary
    const [brandCount, modelCount, productNameCount, partNameCount, categoryCount] = await Promise.all([
      prisma.masterBrand.count(),
      prisma.masterModel.count(),
      prisma.masterProductName.count(),
      prisma.masterPartName.count(),
      prisma.masterCategory.count()
    ]);

    console.log('\n📊 Master Data Summary:');
    console.log(`🏷️ Brands: ${brandCount}`);
    console.log(`📱 Models: ${modelCount}`);
    console.log(`📦 Product Names: ${productNameCount}`);
    console.log(`🔧 Part Names: ${partNameCount}`);
    console.log(`📂 Categories: ${categoryCount}`);

  } catch (error) {
    console.error('❌ Error seeding master data:', error);
    throw error;
  }
}

// Run the seed function
seedMasterData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
