const express          = require('express');
const { protect }      = require('../middleware/authMiddleware');
const User             = require('../models/User');

const router = express.Router();

// All routes below are protected
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/profile
// Returns the logged-in user's full profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/profile', (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/user/profile
// Update name, isDeaf, preferredLang, avatar
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/profile', async (req, res, next) => {
  const allowed = ['name', 'isDeaf', 'preferredLang', 'avatar'];
  const updates = {};
  allowed.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Profile updated', user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/user/change-password
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/change-password', async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/user/account
// Permanently delete logged-in user's account
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/account', async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: 'Account deleted permanently. We are sorry to see you go.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
