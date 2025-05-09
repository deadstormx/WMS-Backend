const express = require('express');
const { getAllPickupsForAdmin } = require('../../controllers/pickups'); // Use the main pickup controller
const { protect, isAdmin } = require('../../../middleware/auth'); // Adjust path
// TODO: Import and add isAdmin middleware if available

const router = express.Router();

// @route   GET /api/admin/pickups/history
// @desc    Get all pickup requests (for admin)
// @access  Private (Admin)
router.get(
  '/history',
  protect, // Apply auth middleware
  isAdmin,
  getAllPickupsForAdmin // Use the correct controller function
);

module.exports = router;
