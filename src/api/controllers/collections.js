const Collection = require('../../models/Collection');

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
const createCollection = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { type, amount, notes, status } = req.body;

    // No type validation, allow any string

    // Create new collection
    const newCollection = new Collection({
      user: req.user.id,
      type,
      amount: amount || 0,
      notes,
      status: status || 'pending'
    });

    const savedCollection = await newCollection.save();

    res.status(201).json({
      message: 'Collection created successfully',
      success: true,
      collection: savedCollection
    });

  } catch (error) {
    console.error("Error creating collection:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'An error occurred while creating the collection.' });
  }
};

// @desc    Get all collections for the logged-in user
// @route   GET /api/collections
// @access  Private
const getCollections = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const collections = await Collection.find({ user: req.user.id })
      .sort({ collectionDate: -1 });

    res.status(200).json({
      success: true,
      count: collections.length,
      collections
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ message: 'An error occurred while fetching collections.' });
  }
};

// @desc    Get collections by type
// @route   GET /api/collections/:type
// @access  Private
const getCollectionsByType = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { type } = req.params;
    // No type validation here
    const collections = await Collection.find({ 
      user: req.user.id,
      type 
    }).sort({ collectionDate: -1 });

    res.status(200).json({
      success: true,
      count: collections.length,
      collections
    });
  } catch (error) {
    console.error("Error fetching collections by type:", error);
    res.status(500).json({ message: 'An error occurred while fetching collections.' });
  }
};

// @desc    Get single collection by ID
// @route   GET /api/collections/:id
// @access  Private
const getCollectionById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const collection = await Collection.findOne({ 
      _id: req.params.id,
      user: req.user.id
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.status(200).json({
      success: true,
      collection
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid collection ID format' });
    }
    res.status(500).json({ message: 'An error occurred while fetching the collection.' });
  }
};

// @desc    Update collection
// @route   PUT /api/collections/:id
// @access  Private
const updateCollection = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { amount, notes, collectionDate } = req.body;

    const collection = await Collection.findOne({ 
      _id: req.params.id,
      user: req.user.id
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Update collection
    collection.amount = amount || collection.amount;
    collection.notes = notes || collection.notes;
    collection.collectionDate = collectionDate || collection.collectionDate;

    const updatedCollection = await collection.save();

    res.status(200).json({
      success: true,
      message: 'Collection updated successfully',
      collection: updatedCollection
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid collection ID format' });
    }
    res.status(500).json({ message: 'An error occurred while updating the collection.' });
  }
};

// @desc    Delete collection
// @route   DELETE /api/collections/:id
// @access  Private
const deleteCollection = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const collection = await Collection.findOne({ 
      _id: req.params.id,
      user: req.user.id
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await collection.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid collection ID format' });
    }
    res.status(500).json({ message: 'An error occurred while deleting the collection.' });
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollectionsByType,
  getCollectionById,
  updateCollection,
  deleteCollection
}; 