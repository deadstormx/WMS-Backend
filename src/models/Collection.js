const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['recyclable', 'non-recyclable', 'organic', 'electric'],
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
  collectionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Collection', collectionSchema); 