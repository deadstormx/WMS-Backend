const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  pickupLocation: {
    type: {
      type: String, // GeoJSON type
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  itemsDescription: {
    type: String,
    required: true,
  },
  requestedTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending',
  },
  // Add any other relevant fields
}, { timestamps: true });

// Index for geospatial queries if needed
pickupSchema.index({ pickupLocation: '2dsphere' });

// Explicitly set the collection name to 'pickup' (singular)
const Pickup = mongoose.model('Pickup', pickupSchema, 'pickup');

module.exports = Pickup;
