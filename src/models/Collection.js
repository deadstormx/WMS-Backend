const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Collection', collectionSchema); 