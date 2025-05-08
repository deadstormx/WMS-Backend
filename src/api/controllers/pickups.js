const Pickup = require('../../models/Pickup');
const User = require('../../models/User'); // Assuming you need user info
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
};

const geocoder = NodeGeocoder(options);

// @desc    Create a new pickup request
// @route   POST /api/pickups
// @access  Private (assuming user needs to be logged in)
const createPickupRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or ID missing' });
    }

    const { address, pickupDateTime, subscription, wasteType, amount, unit, route } = req.body;

    // Basic validation
    if (!address || !pickupDateTime || !subscription || !wasteType || !amount || !unit || !route) {
      return res.status(400).json({ message: 'Missing required fields for pickup request' });
    }

    const newPickup = new Pickup({
      userId,
      address,
      pickupDateTime,
      subscription,
      wasteType,
      amount,
      unit,
      route
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

// @desc    Get pickup history for a specific user
// @route   GET /api/pickups/history
// @access  Private
const getUserPickups = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or ID missing' });
    }

    const pickups = await Pickup.find({ userId }).sort({ pickupDateTime: -1 });

    res.status(200).json({
      message: 'Pickup history retrieved successfully for user',
      pickups: pickups,
    });
  } catch (error) {
    console.error('Error retrieving pickup history for user:', error);
    return res.status(500).json({ message: 'Server error retrieving pickup history for user', error: error.message });
  }
};

// @desc    Get all pickup history (for admin)
// @route   GET /api/admin/pickups/history
// @access  Private (Admin) - Ideally behind admin auth middleware
const getAllPickupsForAdmin = async (req, res) => {
  try {
    // Fetch all pickups and populate user details
    const allPickups = await Pickup.find({})
                                   .populate('userId', 'fullName email') 
                                   .sort({ pickupDateTime: -1 });

    res.status(200).json({
      message: 'All pickup history retrieved successfully (admin)',
      count: allPickups.length,
      pickups: allPickups,
    });
  } catch (error) {
    console.error('Error retrieving all pickup history (admin):', error);
    return res.status(500).json({ message: 'Server error retrieving all pickup history (admin)', error: error.message });
  }
};


// @desc    Update a pickup request
// @route   PUT /api/pickups/:id
// @access  Private
const updatePickup = async (req, res) => {
  try {
    const pickupId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or ID missing' });
    }

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickup.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only update your own pickup requests' });
    }

    // Update the pickup with the request body
    const { address, pickupDateTime, subscription, wasteType, amount, unit, route } = req.body;

    pickup.address = address;
    pickup.pickupDateTime = pickupDateTime;
    pickup.subscription = subscription;
    pickup.wasteType = wasteType;
    pickup.amount = amount;
    pickup.unit = unit;
    pickup.route = route;

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
    const pickupId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or ID missing' });
    }

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickup.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only cancel your own pickup requests' });
    }

    await Pickup.findByIdAndDelete(pickupId);

    res.status(200).json({ message: 'Pickup request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling pickup request:', error);
    return res.status(500).json({ message: 'Server error cancelling pickup request', error: error.message });
  }
};

// Function to handle pickup location input (Updated for consistency)
const addPickupLocation = async (req, res) => {
  try {
    // Use lowercase 'address' consistent with other functions
    const { address, pickupDateTime, subscription, wasteType, amount, unit } = req.body;
    const userId = req.user?.id; // Assuming user ID is available in req.user

    // Validate input data
    if (!address || !pickupDateTime || !subscription || !wasteType || !amount || !unit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Removed geocoding logic

    // Create a new Pickup object
    const pickup = new Pickup({
      userId,
      address, // Use the address string directly
      pickupDateTime,
      subscription,
      wasteType,
      amount,
      unit
    });

    // Save the Pickup object to the database
    const savedPickup = await pickup.save();

    res.status(201).json({ message: 'Pickup location added successfully', pickup: savedPickup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add pickup location', error: error.message });
  }
};

module.exports = {
  createPickupRequest: createPickupRequest,
  getUserPickups: getUserPickups, // Renamed from getPickupHistory
  getAllPickupsForAdmin: getAllPickupsForAdmin,
  updatePickup: updatePickup,
  cancelPickup: cancelPickup,
  addPickupLocation: addPickupLocation
};
