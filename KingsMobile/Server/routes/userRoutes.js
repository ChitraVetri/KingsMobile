const express = require('express');
const { body } = require('express-validator');
const {
  login,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  getProfile
} = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// F1.2: User Authentication - Login
router.post('/login', [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], login);

// Get current user profile (requires authentication)
router.get('/profile', authenticateToken, getProfile);

// F1.3: User Administration Routes (Admin Only)

// Create new user
router.post('/', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'SALES_STAFF', 'TECHNICIAN'])
    .withMessage('Role must be ADMIN, SALES_STAFF, or TECHNICIAN')
], createUser);

// Get all users
router.get('/', [
  authenticateToken,
  requireRole(['ADMIN'])
], getAllUsers);

// Get user by ID
router.get('/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], getUserById);

// Update user
router.put('/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'SALES_STAFF', 'TECHNICIAN'])
    .withMessage('Role must be ADMIN, SALES_STAFF, or TECHNICIAN')
], updateUser);

module.exports = router;
