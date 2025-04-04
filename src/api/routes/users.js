const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/users');
// const { protect } = require('../../middleware/auth'); // protect middleware might not be needed here anymore unless other user routes need it

// Public routes
router.post('/register', registerUser);

// If there are other user-specific protected routes, they would go here
// Example: router.get('/profile', protect, getUserProfile);

module.exports = () => router;
