const express = require('express');
const { body } = require('express-validator');
const {
  createRepairJob,
  getAllRepairJobs,
  getRepairJobById,
  assignTechnician,
  updateRepairJobStatus,
  addPartToRepairJob,
  removePartFromRepairJob,
  generateRepairInvoice,
  getCustomerRepairHistory
} = require('../controllers/repairController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// F4.1: Job Creation & Tracking

// Create repair job (Admin and Sales Staff can create)
router.post('/', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF']),
  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters'),
  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('deviceInfo')
    .notEmpty()
    .withMessage('Device information is required')
    .isLength({ min: 5 })
    .withMessage('Device information must be at least 5 characters'),
  body('reportedIssue')
    .notEmpty()
    .withMessage('Reported issue is required')
    .isLength({ min: 10 })
    .withMessage('Reported issue must be at least 10 characters')
], createRepairJob);

// Get all repair jobs (Admin and Technician can view)
router.get('/', [
  authenticateToken,
  requireRole(['ADMIN', 'TECHNICIAN'])
], getAllRepairJobs);

// Get repair job by ID
router.get('/:id', [
  authenticateToken,
  requireRole(['ADMIN', 'TECHNICIAN', 'SALES_STAFF'])
], getRepairJobById);

// F4.2: Repair Workflow

// Assign technician to repair job (Admin only)
router.put('/:id/assign-technician', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('technicianId')
    .notEmpty()
    .withMessage('Technician ID is required')
    .isString()
    .withMessage('Technician ID must be a string')
], assignTechnician);

// Update repair job status (Admin and assigned Technician)
router.put('/:id/status', [
  authenticateToken,
  requireRole(['ADMIN', 'TECHNICIAN']),
  body('status')
    .isIn(['RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'])
    .withMessage('Status must be RECEIVED, IN_PROGRESS, COMPLETED, or DELIVERED'),
  body('laborCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Labor cost must be a positive number')
], updateRepairJobStatus);

// Add spare part to repair job (Admin and Technician)
router.post('/:id/parts', [
  authenticateToken,
  requireRole(['ADMIN', 'TECHNICIAN']),
  body('repairPartId')
    .notEmpty()
    .withMessage('Repair part ID is required'),
  body('quantityUsed')
    .isInt({ min: 1 })
    .withMessage('Quantity used must be a positive integer')
], addPartToRepairJob);

// Remove spare part from repair job (Admin and Technician)
router.delete('/:id/parts/:usageId', [
  authenticateToken,
  requireRole(['ADMIN', 'TECHNICIAN'])
], removePartFromRepairJob);

// F4.3: Repair Billing

// Generate repair invoice (Admin and Sales Staff)
router.get('/:id/invoice', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], generateRepairInvoice);

// Get customer repair history (Admin and Sales Staff)
router.get('/customer/:customerId/history', [
  authenticateToken,
  requireRole(['ADMIN', 'SALES_STAFF'])
], getCustomerRepairHistory);

module.exports = router;
