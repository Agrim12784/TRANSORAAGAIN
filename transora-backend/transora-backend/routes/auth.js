const express              = require('express');
const { body }             = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect }          = require('../middleware/authMiddleware');

const router = express.Router();

// ── Validation rules ──────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 60 }).withMessage('Name cannot exceed 60 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('isDeaf')
    .optional()
    .isBoolean().withMessage('isDeaf must be a boolean'),

  body('preferredLang')
    .optional()
    .isIn(['ASL', 'BSL', 'ISL', 'other']).withMessage('preferredLang must be ASL, BSL, ISL, or other')
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];

// ── Routes ────────────────────────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', registerRules, register);

// POST /api/auth/login
router.post('/login', loginRules, login);

// GET  /api/auth/me  (protected)
router.get('/me', protect, getMe);

// POST /api/auth/logout  (protected)
router.post('/logout', protect, logout);

module.exports = router;
