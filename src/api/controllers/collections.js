const Collection = require('../../models/Collection');
const Pickup = require('../../models/Pickup');

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Public
const createCollection = async (req, res) => {
  try {
    const { type, amount, notes, userId } = req.body;

    const newCollection = new Collection({
      user: userId || null,
      type,
      amount: amount || 0,
      notes
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

// @desc    Get all collections
// @route   GET /api/collections
// @access  Public
const getCollections = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { user: userId } : {};

    // Step 1: Aggregate pickups by lowercase wasteType
    const pickupSums = await Pickup.aggregate([
      {
        $group: {
          _id: { $toLower: "$wasteType" },
          totalAmountKg: {
            $sum: {
              $cond: [
                { $eq: ["$unit", "g"] },
                { $divide: ["$amount", 1000] },
                "$amount"
              ]
            }
          }
        }
      }
    ]);

    // Step 2: Create a map from wasteType -> totalAmount
    const pickupMap = {};
    pickupSums.forEach(p => {
      pickupMap[p._id] = p.totalAmountKg;
    });

    // Step 3: Fetch all existing collections
    const collections = await Collection.find(query);

    // Step 4: Update each collection based on matching wasteType (case-insensitive)
    for (const col of collections) {
      const wasteTypeLower = col.type.toLowerCase();
      const newAmount = pickupMap[wasteTypeLower] ?? 0;

      if (col.amount !== newAmount) {
        col.amount = newAmount;
        await col.save();
      }
    }

    // Step 5: Return the updated collections
    const updatedCollections = await Collection.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: updatedCollections.length,
      collections: updatedCollections
    });

  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ message: 'An error occurred while fetching collections.' });
  }
};

// @desc    Get collections by type
// @route   GET /api/collections/:type
// @access  Public
const getCollectionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { userId } = req.query;

    const query = { type };
    if (userId) query.user = userId;

    const collections = await Collection.find(query).sort({ createdAt: -1 });

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
// @access  Public
const getCollectionById = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = { _id: req.params.id };
    if (userId) query.user = userId;

    const collection = await Collection.findOne(query);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.status(200).json({ success: true, collection });
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
// @access  Public
const updateCollection = async (req, res) => {
  try {
    const { type, amount, notes, collectionDate, userId } = req.body;

    const query = { _id: req.params.id };
    if (userId) query.user = userId;

    const collection = await Collection.findOne(query);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Only update fields if they are provided
    collection.type = type || collection.type;
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
// @access  Public
const deleteCollection = async (req, res) => {
  try {
    const { userId } = req.body;
    const query = { _id: req.params.id };
    if (userId) query.user = userId;

    const collection = await Collection.findOne(query);

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
