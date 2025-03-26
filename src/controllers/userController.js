const User = require('../models/User');

async function registerUser(req, res, db) {
  const { fullName, email, password } = req.body;
  const collection = db.collection('users');
  try {
    console.log("Register: Attempting to find existing user with email:", email);
    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    console.log("Register: existingUser:", existingUser);
    if (existingUser) {
      console.log("Register: User already exists");
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUser = new User(fullName, email, password);
    await newUser.hashPassword();

    console.log("Register: Attempting to insert new user:", { fullName, email, password: newUser.password });
    // Store the user data
    const result = await collection.insertOne({ fullName, email, password: newUser.password });
    console.log("Register: Inserted user:", result.insertedId);

    // Send a response back to the frontend
    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error("Register: Error registering user:", error);
    // Provide more specific error information in the response
    res.status(500).json({ message: 'An error occurred during registration.', error: error.message });
  }
}

async function loginUser(req, res, db) {
  const { email, password } = req.body;
  const collection = db.collection('users');
  try {
    console.log("Login: Attempting to find user with email:", email);
    // Find the user
    const user = await collection.findOne({ email });
    console.log("Login: user:", user);

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      console.log("Login: Invalid credentials");
      return res.status(401).json({ message: 'Invalid credentials.', success: false });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log("Login: Invalid credentials");
      return res.status(401).json({ message: 'Invalid credentials.', success: false });
    }

    // Send a success response
    res.status(200).json({ message: 'Login successful!', success: true });
  } catch (error) {
    console.error("Login: Error logging in:", error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
}

module.exports = { registerUser, loginUser };
