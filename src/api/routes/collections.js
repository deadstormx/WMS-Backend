const express = require('express');
const { createCollection } = require('../controllers/collections');
const { protect } = require('../../middleware/auth'); // Assuming auth middleware is here

const router = express.Router();

// @route   POST /api/collections
// @desc    Create a new collection record for the logged-in user
// @access  Private
router.post('/', protect, createCollection);

// Add other collection-related routes here later if needed (e.g., GET, PUT, DELETE)

module.exports = router;
