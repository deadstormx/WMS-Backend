const User = require('../models/User');

async function registerUser(req, res) {
  // Destructure address along with other fields
  const { fullName, email, password, address } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Include address when creating the new user
    const newUser = new User({ fullName, email, password, address });
    await newUser.save();

    // Send a response back to the frontend
    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error("Error registering user:", error);
    // Provide more specific error information in the response
    res.status(500).json({ message: 'An error occurred during registration.', error: error.message });
  }
}

module.exports = { registerUser };
