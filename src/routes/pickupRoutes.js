const express = require('express');
const { createPickupRequest, getPickupHistory } = require('../controllers/pickup_controller');
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
);

// Add other routes for pickup management as needed
const { updatePickup, cancelPickup } = require('../controllers/pickup_controller');

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

module.exports = router;
