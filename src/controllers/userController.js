const User = require('../models/User');
const bcrypt = require('bcrypt');

async function registerUser(req, res) {
  const { fullName, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUser = new User({ fullName, email, password });
    await newUser.save();

    // Send a response back to the frontend
    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error("Error registering user:", error);
    // Provide more specific error information in the response
    res.status(500).json({ message: 'An error occurred during registration.', error: error.message });
  }
}

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

    // Send a success response
    res.status(200).json({ message: 'Login successful!', success: true });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
}

module.exports = { registerUser, loginUser };
