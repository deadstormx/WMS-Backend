const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/auth');
const { protect } = require('../../middleware/auth'); // Import the protect middleware
const User = require('../../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Public routes
router.post('/login', loginUser);

// Protected routes
router.post('/logout', protect, logoutUser); // Logout route remains protected

// API 1: Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found in database' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiration
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// API 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Generate a temporary token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    otpStore.set(email, {
      ...storedData,
      resetToken,
      tokenExpiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    res.status(200).json({ 
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// API 3: Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const storedData = otpStore.get(email);
    if (!storedData || !storedData.resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (Date.now() > storedData.tokenExpiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    if (storedData.resetToken !== resetToken) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Update password in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Clear OTP and reset token
    otpStore.delete(email);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = () => router;
