const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference to the User model
  },
  collectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  organicCollected: {
    type: Number,
    required: true,
    default: 0
  },
  recyclableCollected: {
    type: Number,
    required: true,
    default: 0
  },
  electricCollection: {
    type: Number,
    required: true,
    default: 0
  },
  nonRecyclableCollection: {
    type: Number,
    required: true,
    default: 0
  },
  totalCollected: {
    type: Number,
    required: true,
    default: 0 // Initially 0, might be calculated later or updated separately
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Collection', collectionSchema);
