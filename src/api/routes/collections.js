const express = require('express');
const { 
  createCollection,
  getCollections,
  getCollectionsByType,
  getCollectionById,
  updateCollection,
  deleteCollection
} = require('../controllers/collections');
const { protect } = require('../../middleware/auth');

const router = express.Router();

// @route   POST /api/collections
// @desc    Create a new collection
// @access  Private
router.post('/', protect, createCollection);

// @route   GET /api/collections
// @desc    Get all collections for the logged-in user
// @access  Private
router.get('/', protect, getCollections);

// @route   GET /api/collections/:type
// @desc    Get collections by type
// @access  Private
router.get('/:type', protect, getCollectionsByType);

// @route   GET /api/collections/:id
// @desc    Get single collection by ID
// @access  Private
router.get('/:id', protect, getCollectionById);

// @route   PUT /api/collections/:id
// @desc    Update a collection
// @access  Private
router.put('/:id', protect, updateCollection);

// @route   DELETE /api/collections/:id
// @desc    Delete a collection
// @access  Private
router.delete('/:id', protect, deleteCollection);

module.exports = router; 