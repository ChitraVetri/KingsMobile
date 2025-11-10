const express = require('express');
const { body } = require('express-validator');
const {
  getAllMasterData,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getModels,
  createModel,
  updateModel,
  deleteModel,
  getProductNames,
  createProductName,
  updateProductName,
  deleteProductName,
  getPartNames,
  createPartName,
  updatePartName,
  deletePartName
} = require('../controllers/masterDataController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all master data (for dropdowns)
router.get('/all', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF', 'TECHNICIAN'])
], getAllMasterData);

// BRANDS ROUTES
router.get('/brands', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getBrands);

router.post('/brands', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], createBrand);

router.put('/brands/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], updateBrand);

router.delete('/brands/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], deleteBrand);

// MODELS ROUTES
router.get('/models', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getModels);

router.post('/models', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Model name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Model name must be between 1 and 50 characters'),
  body('brandId')
    .notEmpty()
    .withMessage('Brand ID is required'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], createModel);

router.put('/models/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Model name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Model name must be between 1 and 50 characters'),
  body('brandId')
    .notEmpty()
    .withMessage('Brand ID is required'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], updateModel);

router.delete('/models/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], deleteModel);

// PRODUCT NAMES ROUTES
router.get('/product-names', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getProductNames);

router.post('/product-names', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], createProductName);

router.put('/product-names/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], updateProductName);

router.delete('/product-names/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], deleteProductName);

// PART NAMES ROUTES
router.get('/part-names', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF', 'TECHNICIAN'])
], getPartNames);

router.post('/part-names', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Part name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Part name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], createPartName);

router.put('/part-names/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name')
    .notEmpty()
    .withMessage('Part name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Part name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
], updatePartName);

router.delete('/part-names/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], deletePartName);

module.exports = router;
