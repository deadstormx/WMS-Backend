const express = require('express');
// Removed getAllPickups import as it's no longer used here
const { createPickupRequest, getUserPickups, updatePickup, cancelPickup, addPickupLocation } = require('../controllers/pickups');
// Import your authentication middleware here if needed
const { protect } = require('../../middleware/auth'); // Import the protect middleware

const router = express.Router();

// @route   POST /api/pickups
// @desc    Create a new pickup request
// @access  Private
router.post('/', protect, createPickupRequest);

// @route   GET /api/pickups/history
// @desc    Get pickup history for a user
// @access  Private
router.get('/history', protect, getUserPickups);

// @route   PUT /api/pickups/:id
// @desc    Update a pickup request
// @access  Private
router.put('/:id', protect, updatePickup);

// @route   DELETE /api/pickups/:id
// @desc    Cancel a pickup request
// @access  Private
router.delete('/:id', protect, cancelPickup);

// @route   POST /api/pickups/location
// @desc    Add pickup location
// @access  Private
router.post('/location', protect, addPickupLocation);


// Add other routes for pickup management as needed
// e.g., router.get('/', protect, getPickups);
// e.g., router.patch('/:id/status', protect, updatePickupStatus);

// Admin routes removed - moved to src/routes/admin/pickupAdminRoutes.js

module.exports = router;
