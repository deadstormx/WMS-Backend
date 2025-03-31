const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // Array of numbers [longitude, latitude]
      required: true
    }
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
  pickupDateTime: {
    type: Date,
    required: true,
  },
  subscription: {
    type: String,
    required: true,
  },
  wasteType: {
    type: String,
    enum: ['organic', 'non-organic', 'both'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'lbs'], // Example units
  }
}, { timestamps: true });


// Explicitly set the collection name to 'pickup' (singular)
const Pickup = mongoose.model('Pickup', pickupSchema, 'pickup');

module.exports = Pickup;
