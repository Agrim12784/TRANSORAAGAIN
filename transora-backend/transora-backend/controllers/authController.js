const jwt              = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User             = require('../models/User');

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

// ── Helper: send token response ───────────────────────────────────────────────
const sendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.toSafeObject()
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new Transora user
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors : errors.array().map(e => ({ field: e.path, msg: e.msg }))
    });
  }

  const { name, email, password, isDeaf, preferredLang } = req.body;

  try {
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isDeaf      : isDeaf || false,
      preferredLang: preferredLang || 'ASL'
    });

    sendToken(user, 201, res, '🤟 Welcome to Transora! Account created successfully.');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login an existing user
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors : errors.array().map(e => ({ field: e.path, msg: e.msg }))
    });
  }

  const { email, password } = req.body;

  try {
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    sendToken(user, 200, res, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user   : req.user.toSafeObject()
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Logout (client discards token; server acknowledges)
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please discard your token on the client side.'
  });
};
