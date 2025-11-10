const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// Get all master data for dropdowns
const getAllMasterData = async (req, res) => {
  try {
    const [brands, models, productNames, partNames, categories] = await Promise.all([
      prisma.masterBrand.findMany({ orderBy: { name: 'asc' } }),
      prisma.masterModel.findMany({ 
        orderBy: { name: 'asc' },
        include: { brand: true }
      }),
      prisma.masterProductName.findMany({ orderBy: { name: 'asc' } }),
      prisma.masterPartName.findMany({ orderBy: { name: 'asc' } }),
      prisma.masterCategory.findMany({ orderBy: { name: 'asc' } })
    ]);

    res.json({
      brands,
      models,
      productNames,
      partNames,
      categories
    });
  } catch (error) {
    console.error('Get master data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// BRANDS CRUD
const getBrands = async (req, res) => {
  try {
    const brands = await prisma.masterBrand.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Check if brand already exists
    const existingBrand = await prisma.masterBrand.findUnique({
      where: { name }
    });

    if (existingBrand) {
      return res.status(400).json({ error: 'Brand already exists' });
    }

    const brand = await prisma.masterBrand.create({
      data: { name, description }
    });

    res.status(201).json({ 
      message: 'Brand created successfully', 
      brand 
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const brand = await prisma.masterBrand.update({
      where: { id },
      data: { name, description }
    });

    res.json({ 
      message: 'Brand updated successfully', 
      brand 
    });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand is being used
    const productsUsingBrand = await prisma.retailProduct.count({
      where: { brand: { equals: id } }
    });

    if (productsUsingBrand > 0) {
      return res.status(400).json({ 
        error: `Cannot delete brand. It is being used by ${productsUsingBrand} products.` 
      });
    }

    await prisma.masterBrand.delete({
      where: { id }
    });

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// MODELS CRUD
const getModels = async (req, res) => {
  try {
    const models = await prisma.masterModel.findMany({
      include: { brand: true },
      orderBy: { name: 'asc' }
    });
    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createModel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, brandId, description } = req.body;

    const model = await prisma.masterModel.create({
      data: { name, brandId, description },
      include: { brand: true }
    });

    res.status(201).json({ 
      message: 'Model created successfully', 
      model 
    });
  } catch (error) {
    console.error('Create model error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateModel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, brandId, description } = req.body;

    const model = await prisma.masterModel.update({
      where: { id },
      data: { name, brandId, description },
      include: { brand: true }
    });

    res.json({ 
      message: 'Model updated successfully', 
      model 
    });
  } catch (error) {
    console.error('Update model error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.masterModel.delete({
      where: { id }
    });

    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PRODUCT NAMES CRUD
const getProductNames = async (req, res) => {
  try {
    const productNames = await prisma.masterProductName.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ productNames });
  } catch (error) {
    console.error('Get product names error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createProductName = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const productName = await prisma.masterProductName.create({
      data: { name, description }
    });

    res.status(201).json({ 
      message: 'Product name created successfully', 
      productName 
    });
  } catch (error) {
    console.error('Create product name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProductName = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const productName = await prisma.masterProductName.update({
      where: { id },
      data: { name, description }
    });

    res.json({ 
      message: 'Product name updated successfully', 
      productName 
    });
  } catch (error) {
    console.error('Update product name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProductName = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.masterProductName.delete({
      where: { id }
    });

    res.json({ message: 'Product name deleted successfully' });
  } catch (error) {
    console.error('Delete product name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PART NAMES CRUD (similar structure)
const getPartNames = async (req, res) => {
  try {
    const partNames = await prisma.masterPartName.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ partNames });
  } catch (error) {
    console.error('Get part names error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPartName = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const partName = await prisma.masterPartName.create({
      data: { name, description }
    });

    res.status(201).json({ 
      message: 'Part name created successfully', 
      partName 
    });
  } catch (error) {
    console.error('Create part name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePartName = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const partName = await prisma.masterPartName.update({
      where: { id },
      data: { name, description }
    });

    res.json({ 
      message: 'Part name updated successfully', 
      partName 
    });
  } catch (error) {
    console.error('Update part name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePartName = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.masterPartName.delete({
      where: { id }
    });

    res.json({ message: 'Part name deleted successfully' });
  } catch (error) {
    console.error('Delete part name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllMasterData,
  
  // Brands
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  
  // Models
  getModels,
  createModel,
  updateModel,
  deleteModel,
  
  // Product Names
  getProductNames,
  createProductName,
  updateProductName,
  deleteProductName,
  
  // Part Names
  getPartNames,
  createPartName,
  updatePartName,
  deletePartName
};
