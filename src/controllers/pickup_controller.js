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

module.exports = {
  createPickupRequest,
  // Export other functions here
};
