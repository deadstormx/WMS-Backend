const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days (adjust as needed)
  });
};

async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    // Find the user
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.', success: false });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.', success: false });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send a success response with the token
    res.status(200).json({
      message: 'Login successful!',
      success: true,
      token: token, // Include the token in the response
      user: { // Optionally send back some user info (excluding password)
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        address: user.address // Include the address here
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

// @desc    Logout user / Clear cookie (if applicable)
// @route   POST /api/users/logout
// @access  Private (requires token)
const logoutUser = (req, res) => {
  // For JWT in headers, the main action is on the client (clearing the token).
  // If using cookies for JWT, you'd clear the cookie here:
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'User logged out successfully' });
};

module.exports = { loginUser, logoutUser };
