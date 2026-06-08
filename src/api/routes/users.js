const express = require('express');
const router = express.Router();
const { registerUser, verifyOtp, deleteAccount, updateUserDetails, uploadAvatar, testCloudinaryConnection, upload } = require('../controllers/users');
const { protect } = require('../../middleware/auth');
// const { protect } = require('../../middleware/auth'); // protect middleware might not be needed here anymore unless other user routes need it

// Public routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.delete('/delete-account', protect, deleteAccount);
router.put('/update-details', protect, updateUserDetails);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/test-cloudinary', protect, testCloudinaryConnection);

// If there are other user-specific protected routes, they would go here
// Example: router.get('/profile', protect, getUserProfile);

module.exports = () => router;
