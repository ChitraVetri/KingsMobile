const express = require('express');
const { body, query } = require('express-validator');
const {
  createSalesCart,
  searchProducts,
  processSale,
  getAllSales,
  getSaleById
} = require('../controllers/salesController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// F3.1: Sales Interface

// Search products for POS (Sales Staff and Admin)
router.get('/products/search', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF']),
  query('query')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('barcode')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Barcode must be at least 3 characters'),
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean value')
], searchProducts);

// Create sales cart (preview before final sale)
router.post('/cart', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF']),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('paymentMode')
    .isIn(['CASH', 'UPI', 'CARD'])
    .withMessage('Payment mode must be CASH, UPI, or CARD'),
  body('discountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  body('customerInfo')
    .optional()
    .isObject()
    .withMessage('Customer info must be an object'),
  body('customerInfo.name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters'),
  body('customerInfo.phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('customerInfo.gstin')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GSTIN format')
], createSalesCart);

// F3.2: Billing & Invoicing

// Process sale (final transaction with stock deduction)
router.post('/', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF']),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('paymentMode')
    .isIn(['CASH', 'UPI', 'CARD'])
    .withMessage('Payment mode must be CASH, UPI, or CARD'),
  body('discountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  body('isInterState')
    .optional()
    .isBoolean()
    .withMessage('isInterState must be a boolean value'),
  body('customerInfo')
    .optional()
    .isObject()
    .withMessage('Customer info must be an object'),
  body('customerInfo.name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters'),
  body('customerInfo.phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('customerInfo.gstin')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GSTIN format'),
  body('customerInfo.address')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters'),
  body('customerInfo.state')
    .optional()
    .isLength({ min: 2 })
    .withMessage('State must be at least 2 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
], processSale);

// Get all sales with filters (Admin and Sales Staff)
router.get('/', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF']),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date'),
  query('paymentMode')
    .optional()
    .isIn(['CASH', 'UPI', 'CARD'])
    .withMessage('Payment mode must be CASH, UPI, or CARD'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], getAllSales);

// Get sale by ID with full invoice (Admin and Sales Staff)
router.get('/:id', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getSaleById);

module.exports = router;
