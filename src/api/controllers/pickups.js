const Pickup = require('../../models/Pickup');
const User = require('../../models/User');
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
};

const geocoder = NodeGeocoder(options);

// @desc    Create a new pickup request
// @route   POST /api/pickups
// @access  Private
const createPickupRequest = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { address, pickupDateTime, subscription, wasteType, amount, unit } = req.body;

    // Basic validation
    if (!address || !pickupDateTime || !subscription || !wasteType || !amount || !unit) {
      return res.status(400).json({ message: 'Missing required fields for pickup request' });
    }

    const newPickup = new Pickup({
      userId: req.user.id, // Always use logged-in user's id
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
    // If admin, return all pickups
    if (req.user && req.user.role === 'admin') {
      const pickups = await Pickup.find()
        .sort({ pickupDateTime: -1 })
        .populate('userId', 'fullName email');
      return res.status(200).json({
        message: 'Pickup history retrieved successfully',
        pickups,
      });
    }

    // Otherwise, return only pickups for the logged-in user
    const pickups = await Pickup.find({ userId: req.user.id })
      .sort({ pickupDateTime: -1 })
      .populate('userId', 'fullName email');
    return res.status(200).json({
      message: 'Pickup history retrieved successfully',
      pickups,
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
// @access  Private
const updatePickup = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const pickupId = req.params.id;
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    // Only allow user to update their own pickup (unless admin)
    if (req.user.role !== 'admin' && pickup.userId && pickup.userId.toString() !== req.user.id) {
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
// @access  Private
const cancelPickup = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const pickupId = req.params.id;
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    // Only allow user to cancel their own pickup (unless admin)
    if (req.user.role !== 'admin' && pickup.userId && pickup.userId.toString() !== req.user.id) {
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
// @access  Private
const addPickupLocation = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { address, pickupDateTime, subscription, wasteType, amount, unit } = req.body;

    // Validate input data
    if (!address || !pickupDateTime || !subscription || !wasteType || !amount || !unit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const pickup = new Pickup({
      userId: req.user.id, // Always use logged-in user's id
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
