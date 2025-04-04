const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/auth');
const { protect } = require('../../middleware/auth'); // Import the protect middleware

// Public routes
router.post('/login', loginUser);

// Protected routes
router.post('/logout', protect, logoutUser); // Logout route remains protected

module.exports = () => router;
