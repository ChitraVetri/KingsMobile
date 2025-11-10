const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// F2.1 & F2.2: Retail Product Management

// Create new retail product (Admin only)
const createRetailProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      category,
      brand,
      model,
      variants,
      imei,
      purchasePrice,
      sellingPrice,
      gstRate,
      quantity,
      barcode,
      lowStockThreshold
    } = req.body;

    // Check if IMEI already exists (if provided)
    if (imei) {
      const existingProduct = await prisma.retailProduct.findUnique({
        where: { imei }
      });
      if (existingProduct) {
        return res.status(400).json({ error: 'IMEI already exists' });
      }
    }

    // Check if barcode already exists (if provided)
    if (barcode) {
      const existingBarcode = await prisma.retailProduct.findUnique({
        where: { barcode }
      });
      if (existingBarcode) {
        return res.status(400).json({ error: 'Barcode already exists' });
      }
    }

    const product = await prisma.retailProduct.create({
      data: {
        name,
        category,
        brand,
        model,
        variants: JSON.stringify(variants || {}),
        imei,
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        gstRate: parseFloat(gstRate) || 18,
        quantity: parseInt(quantity),
        barcode,
        lowStockThreshold: parseInt(lowStockThreshold) || 5
      }
    });

    // Parse variants back to object for response
    const responseProduct = {
      ...product,
      variants: JSON.parse(product.variants)
    };

    res.status(201).json({
      message: 'Retail product created successfully',
      product: responseProduct
    });
  } catch (error) {
    console.error('Create retail product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all retail products
const getAllRetailProducts = async (req, res) => {
  try {
    const { category, brand, lowStock } = req.query;
    
    let whereClause = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (brand) {
      whereClause.brand = brand;
    }
    
    if (lowStock === 'true') {
      whereClause.quantity = {
        lte: prisma.retailProduct.fields.lowStockThreshold
      };
    }

    const products = await prisma.retailProduct.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Parse variants for all products
    const productsWithParsedVariants = products.map(product => ({
      ...product,
      variants: JSON.parse(product.variants)
    }));

    res.json({ products: productsWithParsedVariants });
  } catch (error) {
    console.error('Get retail products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get retail product by ID
const getRetailProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.retailProduct.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const responseProduct = {
      ...product,
      variants: JSON.parse(product.variants)
    };

    res.json({ product: responseProduct });
  } catch (error) {
    console.error('Get retail product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update retail product (Admin only)
const updateRetailProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if product exists
    const existingProduct = await prisma.retailProduct.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle variants
    if (updateData.variants) {
      updateData.variants = JSON.stringify(updateData.variants);
    }

    // Convert numeric fields
    if (updateData.purchasePrice) updateData.purchasePrice = parseFloat(updateData.purchasePrice);
    if (updateData.sellingPrice) updateData.sellingPrice = parseFloat(updateData.sellingPrice);
    if (updateData.gstRate) updateData.gstRate = parseFloat(updateData.gstRate);
    if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
    if (updateData.lowStockThreshold) updateData.lowStockThreshold = parseInt(updateData.lowStockThreshold);

    const updatedProduct = await prisma.retailProduct.update({
      where: { id },
      data: updateData
    });

    const responseProduct = {
      ...updatedProduct,
      variants: JSON.parse(updatedProduct.variants)
    };

    res.json({
      message: 'Product updated successfully',
      product: responseProduct
    });
  } catch (error) {
    console.error('Update retail product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// F2.1 & F2.2: Repair Part Management

// Create new repair part (Admin only)
const createRepairPart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      partNumber,
      compatibleModels,
      costPrice,
      quantity,
      lowStockThreshold
    } = req.body;

    // Check if part number already exists (if provided)
    if (partNumber) {
      const existingPart = await prisma.repairPart.findUnique({
        where: { partNumber }
      });
      if (existingPart) {
        return res.status(400).json({ error: 'Part number already exists' });
      }
    }

    const repairPart = await prisma.repairPart.create({
      data: {
        name,
        partNumber,
        compatibleModels: JSON.stringify(compatibleModels || []),
        costPrice: parseFloat(costPrice),
        quantity: parseInt(quantity),
        lowStockThreshold: parseInt(lowStockThreshold) || 5
      }
    });

    const responsePart = {
      ...repairPart,
      compatibleModels: JSON.parse(repairPart.compatibleModels)
    };

    res.status(201).json({
      message: 'Repair part created successfully',
      repairPart: responsePart
    });
  } catch (error) {
    console.error('Create repair part error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all repair parts
const getAllRepairParts = async (req, res) => {
  try {
    const { lowStock, compatibleModel } = req.query;
    
    let whereClause = {};
    
    if (lowStock === 'true') {
      whereClause.quantity = {
        lte: prisma.repairPart.fields.lowStockThreshold
      };
    }

    const repairParts = await prisma.repairPart.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Parse compatible models and filter if needed
    let partsWithParsedModels = repairParts.map(part => ({
      ...part,
      compatibleModels: JSON.parse(part.compatibleModels)
    }));

    // Filter by compatible model if specified
    if (compatibleModel) {
      partsWithParsedModels = partsWithParsedModels.filter(part =>
        part.compatibleModels.includes(compatibleModel)
      );
    }

    res.json({ repairParts: partsWithParsedModels });
  } catch (error) {
    console.error('Get repair parts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get repair part by ID
const getRepairPartById = async (req, res) => {
  try {
    const { id } = req.params;

    const repairPart = await prisma.repairPart.findUnique({
      where: { id }
    });

    if (!repairPart) {
      return res.status(404).json({ error: 'Repair part not found' });
    }

    const responsePart = {
      ...repairPart,
      compatibleModels: JSON.parse(repairPart.compatibleModels)
    };

    res.json({ repairPart: responsePart });
  } catch (error) {
    console.error('Get repair part error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update repair part (Admin only)
const updateRepairPart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if repair part exists
    const existingPart = await prisma.repairPart.findUnique({
      where: { id }
    });

    if (!existingPart) {
      return res.status(404).json({ error: 'Repair part not found' });
    }

    // Handle compatible models
    if (updateData.compatibleModels) {
      updateData.compatibleModels = JSON.stringify(updateData.compatibleModels);
    }

    // Convert numeric fields
    if (updateData.costPrice) updateData.costPrice = parseFloat(updateData.costPrice);
    if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
    if (updateData.lowStockThreshold) updateData.lowStockThreshold = parseInt(updateData.lowStockThreshold);

    const updatedPart = await prisma.repairPart.update({
      where: { id },
      data: updateData
    });

    const responsePart = {
      ...updatedPart,
      compatibleModels: JSON.parse(updatedPart.compatibleModels)
    };

    res.json({
      message: 'Repair part updated successfully',
      repairPart: responsePart
    });
  } catch (error) {
    console.error('Update repair part error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// F2.3: Low Stock Alerts
const getLowStockItems = async (req, res) => {
  try {
    // Get low stock retail products
    const lowStockProducts = await prisma.$queryRaw`
      SELECT * FROM RetailProduct 
      WHERE quantity <= lowStockThreshold
      ORDER BY quantity ASC
    `;

    // Get low stock repair parts
    const lowStockParts = await prisma.$queryRaw`
      SELECT * FROM RepairPart 
      WHERE quantity <= lowStockThreshold
      ORDER BY quantity ASC
    `;

    // Parse JSON fields
    const parsedProducts = lowStockProducts.map(product => ({
      ...product,
      type: 'retail_product',
      variants: JSON.parse(product.variants)
    }));

    const parsedParts = lowStockParts.map(part => ({
      ...part,
      type: 'repair_part',
      compatibleModels: JSON.parse(part.compatibleModels)
    }));

    res.json({
      lowStockItems: {
        retailProducts: parsedProducts,
        repairParts: parsedParts,
        totalCount: parsedProducts.length + parsedParts.length
      }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  // Retail Products
  createRetailProduct,
  getAllRetailProducts,
  getRetailProductById,
  updateRetailProduct,
  
  // Repair Parts
  createRepairPart,
  getAllRepairParts,
  getRepairPartById,
  updateRepairPart,
  
  // Low Stock Alerts
  getLowStockItems
};
