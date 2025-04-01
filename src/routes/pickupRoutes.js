const express = require('express');
// Removed getAllPickups import as it's no longer used here
const { createPickupRequest, getPickupHistory, updatePickup, cancelPickup } = require('../controllers/pickup_controller');
// Import your authentication middleware here if needed
const { protect } = require('../middlewares/authMiddleware'); // Import the protect middleware

const router = express.Router();

// @route   POST /api/pickups
// @desc    Create a new pickup request
// @access  Private (requires authentication)
router.post(
  '/',
  protect, // Apply the protect middleware
  createPickupRequest
);

// @route   GET /api/pickups/history
// @desc    Get pickup history for a user
// @access  Private (requires authentication)
router.get(
  '/history',
  protect,
  getPickupHistory
); // Added closing parenthesis and semicolon

// @route   PUT /api/pickups/:id
// @desc    Update a pickup request
// @access  Private (requires authentication)
router.put(
  '/:id',
  protect,
  updatePickup
);

// @route   DELETE /api/pickups/:id
// @desc    Cancel a pickup request
// @access  Private (requires authentication)
router.delete(
  '/:id',
  protect,
  cancelPickup
);

// Add other routes for pickup management as needed
// e.g., router.get('/', protect, getPickups);
// e.g., router.patch('/:id/status', protect, updatePickupStatus);

// Admin routes removed - moved to src/routes/admin/pickupAdminRoutes.js

module.exports = router;
