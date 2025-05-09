const Pickup = require('../../models/Pickup');
const User = require('../../models/User');
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
};

const geocoder = NodeGeocoder(options);

// @desc    Create a new pickup request
// @route   POST /api/pickups
// @access  Public
const createPickupRequest = async (req, res) => {
  try {
    const { address, pickupDateTime, subscription, wasteType, amount, unit, userId } = req.body;

    // Basic validation
    if (!address || !pickupDateTime || !subscription || !wasteType || !amount || !unit) {
      return res.status(400).json({ message: 'Missing required fields for pickup request' });
    }

    const newPickup = new Pickup({
      userId: userId || null, // Make userId optional
      address,
      pickupDateTime,
      subscription,
      wasteType,
      amount,
      unit,
    });

    const savedPickup = await newPickup.save();

    res.status(201).json({
      message: 'Pickup request created successfully',
      pickup: savedPickup,
    });
  } catch (error) {
    console.error('Error creating pickup request:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Server error creating pickup request', error: error.message });
    }
  }
};

// @desc    Get pickup history
// @route   GET /api/pickups/history
// @access  Public
const getUserPickups = async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query parameters

    // If userId is provided, filter by that user, otherwise return all pickups
    const query = userId ? { userId } : {};
    
    const pickups = await Pickup.find(query)
      .sort({ pickupDateTime: -1 })
      .populate('userId', 'fullName email');

    res.status(200).json({
      message: 'Pickup history retrieved successfully',
      pickups: pickups,
    });
  } catch (error) {
    console.error('Error retrieving pickup history:', error);
    return res.status(500).json({ message: 'Server error retrieving pickup history', error: error.message });
  }
};

// @desc    Get all pickup history (for admin)
// @route   GET /api/admin/pickups/history
// @access  Private (Admin)
const getAllPickupsForAdmin = async (req, res) => {
  try {
    // Fetch all pickups and populate user details
    const allPickups = await Pickup.find({})
      .populate('userId', 'fullName email')
      .sort({ pickupDateTime: -1 });

    res.status(200).json({
      message: 'All pickup history retrieved successfully',
      count: allPickups.length,
      pickups: allPickups,
    });
  } catch (error) {
    console.error('Error retrieving all pickup history:', error);
    return res.status(500).json({ message: 'Server error retrieving all pickup history', error: error.message });
  }
};

// @desc    Update a pickup request
// @route   PUT /api/pickups/:id
// @access  Public
const updatePickup = async (req, res) => {
  try {
    const pickupId = req.params.id;
    const { userId } = req.body; // Get userId from request body

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    // If userId is provided, verify ownership
    if (userId && pickup.userId && pickup.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only update your own pickup requests' });
    }

    const { address, pickupDateTime, subscription, wasteType, amount, unit } = req.body;

    pickup.address = address;
    pickup.pickupDateTime = pickupDateTime;
    pickup.subscription = subscription;
    pickup.wasteType = wasteType;
    pickup.amount = amount;
    pickup.unit = unit;

    const updatedPickup = await pickup.save();

    res.status(200).json({
      message: 'Pickup request updated successfully',
      pickup: updatedPickup,
    });
  } catch (error) {
    console.error('Error updating pickup request:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Server error updating pickup request', error: error.message });
  }
};

// @desc    Cancel a pickup request
// @route   DELETE /api/pickups/:id
// @access  Public
const cancelPickup = async (req, res) => {
  try {
    const pickupId = req.params.id;
    const { userId } = req.body; // Get userId from request body

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    // If userId is provided, verify ownership
    if (userId && pickup.userId && pickup.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only cancel your own pickup requests' });
    }

    await Pickup.findByIdAndDelete(pickupId);

    res.status(200).json({ message: 'Pickup request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling pickup request:', error);
    return res.status(500).json({ message: 'Server error cancelling pickup request', error: error.message });
  }
};

// @desc    Add pickup location
// @route   POST /api/pickups/location
// @access  Public
const addPickupLocation = async (req, res) => {
  try {
    const { address, pickupDateTime, subscription, wasteType, amount, unit, userId } = req.body;

    // Validate input data
    if (!address || !pickupDateTime || !subscription || !wasteType || !amount || !unit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const pickup = new Pickup({
      userId: userId || null, // Make userId optional
      address,
      pickupDateTime,
      subscription,
      wasteType,
      amount,
      unit
    });

    const savedPickup = await pickup.save();

    res.status(201).json({ message: 'Pickup location added successfully', pickup: savedPickup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add pickup location', error: error.message });
  }
};

module.exports = {
  createPickupRequest,
  getUserPickups,
  getAllPickupsForAdmin,
  updatePickup,
  cancelPickup,
  addPickupLocation
};
