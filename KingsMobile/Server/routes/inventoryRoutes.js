const express = require('express');
const { body } = require('express-validator');
const {
  // Use bridge controller for retail products (maintains compatibility)
  getAllRetailProducts,
  createRetailProduct,
  updateRetailProduct
} = require('../controllers/bridgeInventoryController');

const {
  // Keep original controller for other functions
  getRetailProductById,
  
  // Repair Parts
  createRepairPart,
  getAllRepairParts,
  getRepairPartById,
  updateRepairPart,
  
  // Analytics
  getLowStockItems
} = require('../controllers/inventoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// F2.3: Low Stock Alerts (Admin and Sales Staff can view)
router.get('/low-stock', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getLowStockItems);

// F2.1 & F2.2: Retail Product Routes

// Create retail product (Admin only)
router.post('/retail-products', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2 })
    .withMessage('Product name must be at least 2 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('brand')
    .notEmpty()
    .withMessage('Brand is required'),
  body('model')
    .notEmpty()
    .withMessage('Model is required'),
  body('purchasePrice')
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  body('gstRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST rate must be between 0 and 100'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  body('imei')
    .optional()
    .isLength({ min: 15, max: 15 })
    .withMessage('IMEI must be exactly 15 digits')
    .matches(/^\d+$/)
    .withMessage('IMEI must contain only digits'),
  body('variants')
    .optional()
    .isObject()
    .withMessage('Variants must be an object')
], createRetailProduct);

// Get all retail products (Sales Staff and Admin can view)
router.get('/retail-products', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getAllRetailProducts);

// Get retail product by ID
router.get('/retail-products/:id', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getRetailProductById);

// Update retail product (Admin only)
router.put('/retail-products/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Product name must be at least 2 characters'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  body('gstRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST rate must be between 0 and 100'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  body('variants')
    .optional()
    .isObject()
    .withMessage('Variants must be an object')
], updateRetailProduct);

// F2.1 & F2.2: Repair Part Routes

// Create repair part (Admin only)
router.post('/repair-parts', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Part name is required')
    .isLength({ min: 2 })
    .withMessage('Part name must be at least 2 characters'),
  body('costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  body('compatibleModels')
    .optional()
    .isArray()
    .withMessage('Compatible models must be an array'),
  body('compatibleModels.*')
    .optional()
    .isString()
    .withMessage('Each compatible model must be a string')
], createRepairPart);

// Get all repair parts (Technician and Admin can view)
router.get('/repair-parts', [
  authenticateToken,
  requireRole(['ADMIN', 'TECHNICIAN'])
], getAllRepairParts);

// Get repair part by ID
router.get('/repair-parts/:id', [
  authenticateToken,
  requireRole(['ADMIN', 'TECHNICIAN'])
], getRepairPartById);

// Update repair part (Admin only)
router.put('/repair-parts/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Part name must be at least 2 characters'),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  body('compatibleModels')
    .optional()
    .isArray()
    .withMessage('Compatible models must be an array'),
  body('compatibleModels.*')
    .optional()
    .isString()
    .withMessage('Each compatible model must be a string')
], updateRepairPart);

module.exports = router;
