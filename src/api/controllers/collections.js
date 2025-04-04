const Collection = require('../../models/Collection');

// @desc    Create a new collection record
// @route   POST /api/collections
// @access  Private (Requires user to be logged in)
const createCollection = async (req, res) => {
  try {
    // req.user.id should be available from the auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create a new collection instance with default values
    // The model defines defaults for numeric fields as 0
    const newCollection = new Collection({
      user: req.user.id, // Link to the logged-in user
      // notes can be optionally added from req.body if needed later
      // notes: req.body.notes || ''
    });

    // Save the new collection to the database
    const savedCollection = await newCollection.save();

    res.status(201).json({
      message: 'New collection created successfully',
      success: true,
      collection: savedCollection
    });

  } catch (error) {
    console.error("Error creating collection:", error);
    // Handle potential validation errors or other DB issues
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'An error occurred while creating the collection.' });
  }
};

module.exports = {
  createCollection
};
