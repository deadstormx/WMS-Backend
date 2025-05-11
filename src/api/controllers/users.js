const User = require('../../models/User');
const Otp = require('../../models/Otp');
const { sendEmail } = require('../../config/email');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');

async function registerUser(req, res) {
  const { fullName, email, phoneNumber, password, address } = req.body;
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    // Check if user already exists with email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Check if user already exists with phone number
    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return res.status(400).json({ message: 'Phone number already registered.' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false
    });

    // Save OTP to database
    await Otp.create({
      email,
      otp
    });

    // Send OTP email
    try {
      await sendEmail(
        email,
        'Verify Your Email - OTP',
        `Your OTP for registration is: ${otp}. This OTP will expire in 5 minutes.`
      );

      res.status(200).json({ 
        message: 'OTP sent successfully. Please check your email.',
        email: email
      });
    } catch (emailError) {
      // If email fails, clean up the OTP record
      await Otp.deleteOne({ email });
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again later.',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ 
      message: 'An error occurred during registration.', 
      error: error.message 
    });
  }
}

async function verifyOtp(req, res) {
  const { email, otp, fullName, phoneNumber, password, address } = req.body;
  
  try {
    // Validate required fields
    if (!email || !otp || !fullName || !password || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email, otp });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP or OTP expired.' });
    }

    // Create new user
    const newUser = new User({ fullName, email, phoneNumber, password, address });
    await newUser.save();

    // Delete the used OTP
    await Otp.deleteOne({ email });

    res.status(200).json({ 
      message: 'Registration successful!',
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber
      }
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ 
      message: 'An error occurred during verification.', 
      error: error.message 
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const userId = req.user._id;

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Account deleted successfully',
      user: {
        id: deletedUser._id,
        email: deletedUser.email
      }
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ 
      message: 'An error occurred while deleting the account', 
      error: error.message 
    });
  }
}

async function updateUserDetails(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, phoneNumber, address, currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic details
    if (fullName) user.fullName = fullName;
    if (address) user.address = address;

    // Update phone number if provided and different
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      // Check if phone number is already in use
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
      user.phoneNumber = phoneNumber;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: 'User details updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address
      }
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ 
      message: 'An error occurred while updating user details', 
      error: error.message 
    });
  }
}

module.exports = { registerUser, verifyOtp, deleteAccount, updateUserDetails };
