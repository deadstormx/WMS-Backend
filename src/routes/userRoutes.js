const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware'); // Import the protect middleware

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.post('/logout', protect, logoutUser); // Add the logout route and protect it

module.exports = () => router;
