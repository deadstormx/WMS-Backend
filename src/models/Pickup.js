const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: false, // Make userId optional
  },
  address: { // Changed from pickupLocation object to simple address string
    type: String,
    required: true,
  },
  route:{
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
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ['kg', 'g'],
    required: true,
  },
}, { timestamps: true });

// Explicitly set collection name to 'pickup'
const Pickup = mongoose.model('Pickup', pickupSchema, 'pickup');

module.exports = Pickup;
