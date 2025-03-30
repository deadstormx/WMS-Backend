const Pickup = require('../models/Pickup');
const User = require('../models/User'); // Assuming you need user info

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

    const { pickupLocation, itemsDescription, address } = req.body; // Removed userId from here

    // Basic validation
    if (!pickupLocation || !pickupLocation.coordinates || !itemsDescription || !address) {
      return res.status(400).json({ message: 'Missing required fields for pickup request' });
    }

    // Validate coordinates format if needed
    if (!Array.isArray(pickupLocation.coordinates) || pickupLocation.coordinates.length !== 2) {
        return res.status(400).json({ message: 'Invalid coordinates format. Use [longitude, latitude].' });
    }

    const newPickup = new Pickup({
      userId,
      pickupLocation: {
        type: 'Point',
        coordinates: pickupLocation.coordinates, // [longitude, latitude]
        address: address,
      },
      itemsDescription,
      // requestedTime is defaulted by schema
      // status is defaulted by schema
    });

    const savedPickup = await newPickup.save();

    res.status(201).json({
      message: 'Pickup request created successfully',
      pickup: savedPickup,
    });
  } catch (error) {
    console.error('Error creating pickup request:', error);
    // More specific error handling can be added (e.g., validation errors)
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error creating pickup request' });
  }
};

// Add other controller functions as needed (e.g., getPickups, updatePickupStatus)

module.exports = {
  createPickupRequest,
  // Export other functions here
};
