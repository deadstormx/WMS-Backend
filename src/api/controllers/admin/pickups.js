const Pickup = require('../../../models/Pickup'); // Adjust path as needed
const User = require('../../../models/User'); // Adjust path as needed

// @desc    Get all pickup requests (for admin panel)
// @route   GET /api/admin/pickups/history
// @access  Private (Admin - requires further role check ideally)
const getAllPickups = async (req, res) => {
  try {
    // Fetch all pickups and populate user details (e.g., name and email)
    // Sort by creation date, newest first
    const allPickups = await Pickup.find({})
                                   .populate('userId', 'fullName email') // Select specific fields from User
                                   .sort({ createdAt: -1 });

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

module.exports = {
  getAllPickups,
};
