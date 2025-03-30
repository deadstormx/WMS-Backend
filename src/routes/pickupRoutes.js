const express = require('express');
const { createPickupRequest } = require('../controllers/pickup_controller');
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

// Add other routes for pickup management as needed
// e.g., router.get('/', protect, getPickups);
// e.g., router.patch('/:id/status', protect, updatePickupStatus);

module.exports = router;
