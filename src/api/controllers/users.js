const User = require('../../models/User');
const Otp = require('../../models/Otp');
const { sendEmail } = require('../../config/email');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../../config/cloudinary');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Pickup = require('../../models/Pickup');

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

    // Delete all pickup requests associated with the user
    await Pickup.deleteMany({ userId: userId });

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Account and associated pickup requests deleted successfully',
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
    const { fullName, email } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (fullName) {
      user.fullName = fullName;
    }

    // Update email if provided and different
    if (email && email !== user.email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Update the email
      user.email = email;

      // Generate new JWT token with updated email
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Save the updated user
      await user.save();

      return res.status(200).json({
        message: 'User details updated successfully',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email
        },
        token: token // Send new token with updated email
      });
    }

    // If only name was updated, save and return without new token
    await user.save();
    res.status(200).json({
      message: 'User details updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
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

// Test Cloudinary connection
async function testCloudinaryConnection(req, res) {
  try {
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', {
      folder: 'test_uploads',
      resource_type: 'auto'
    });
    res.status(200).json({ 
      message: 'Cloudinary connection successful',
      result 
    });
  } catch (error) {
    console.error('Cloudinary connection test failed:', error);
    res.status(500).json({ 
      message: 'Cloudinary connection failed',
      error: error.message,
      details: error.error || error
    });
  }
}

async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('Attempting to upload to Cloudinary...');
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'user_avatars',
      resource_type: 'auto'
    });

    console.log('Cloudinary upload successful:', result);

    // Delete old avatar from Cloudinary if exists
    if (user.avatar?.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(user.avatar.cloudinaryId);
        console.log('Old avatar deleted successfully');
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
        // Continue with the update even if deletion fails
      }
    }

    // Update user avatar in database
    user.avatar = {
      cloudinaryId: result.public_id,
      url: result.secure_url
    };
    await user.save();

    console.log('User avatar updated in database');

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    // Log more detailed error information
    console.error('Error details:', {
      message: error.message,
      error: error.error,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'An error occurred while uploading avatar',
      error: error.message,
      details: error.error || error
    });
  }
}

module.exports = { 
  registerUser, 
  verifyOtp, 
  deleteAccount, 
  updateUserDetails,
  uploadAvatar,
  testCloudinaryConnection,
  upload // Export multer middleware
};
