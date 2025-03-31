const Pickup = require('../models/Pickup');
const User = require('../models/User'); // Assuming you need user info
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
    // Assuming userId is available from auth middleware (e.g., req.user.id)
    // If not, you might need to pass it in the request body or adjust
    // Get userId from the protect middleware
    const userId = req.user?.id; // Use the id from the authenticated user
    if (!userId) {
      // This case should ideally be caught by the protect middleware itself
      return res.status(401).json({ message: 'User not authenticated or ID missing' });
    }

    const { address, pickupDateTime, subscription, wasteType, amount, unit } = req.body; // Removed userId from here

    // Basic validation
    if (!address || !pickupDateTime || !subscription || !wasteType || !amount || !unit) {
      return res.status(400).json({ message: 'Missing required fields for pickup request' });
    }

    // Geocode the address
    // const geocodeResult = await geocoder.geocode(address);
    // if (!geocodeResult || geocodeResult.length === 0) {
    //   return res.status(400).json({ message: 'Unable to geocode address' });
    // }

    // const { latitude, longitude } = geocodeResult[0];

    // Replace with actual latitude and longitude for Kathmandu
    const latitude = 27.7172;
    const longitude = 85.3240;

    const newPickup = new Pickup({
      userId,
      pickupDateTime,
      subscription,
      wasteType,
      amount,
      unit,
      pickupLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      // requestedTime is defaulted by schema
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

// Add other controller functions as needed (e.g., getPickups, updatePickupStatus)

// @desc    Get pickup history for a user
// @route   GET /api/pickups/history
// @access  Private
const getPickupHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or ID missing' });
    }

    const pickups = await Pickup.find({ userId }).sort({ pickupDateTime: -1 });

    res.status(200).json({
      message: 'Pickup history retrieved successfully',
      pickups: pickups,
    });
  } catch (error) {
    console.error('Error retrieving pickup history:', error);
    return res.status(500).json({ message: 'Server error retrieving pickup history', error: error.message });
  }
};

module.exports = {
  createPickupRequest,
  getPickupHistory,
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
    const { address, pickupDateTime, subscription, wasteType, amount, unit } = req.body;

     // Geocode the address
    // const geocodeResult = await geocoder.geocode(address);
    // if (!geocodeResult || geocodeResult.length === 0) {
    //   return res.status(400).json({ message: 'Unable to geocode address' });
    // }

    // const { latitude, longitude } = geocodeResult[0];

    // Replace with actual latitude and longitude for Kathmandu
    const latitude = 27.7172;
    const longitude = 85.3240;

    pickup.pickupLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
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

module.exports = {
  createPickupRequest,
  getPickupHistory,
  updatePickup,
  cancelPickup
};
