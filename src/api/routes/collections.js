const express = require('express');
const { 
  createCollection,
  getCollections,
  getCollectionsByType,
  getCollectionById,
  updateCollection,
  deleteCollection
} = require('../controllers/collections');

const router = express.Router();

// @route   POST /api/collections
// @desc    Create a new collection
// @access  Public
router.post('/', createCollection);

// @route   GET /api/collections
// @desc    Get all collections
// @access  Public
router.get('/', getCollections);

// @route   GET /api/collections/:type
// @desc    Get collections by type
// @access  Public
router.get('/:type', getCollectionsByType);

// @route   GET /api/collections/:id
// @desc    Get single collection by ID
// @access  Public
router.get('/:id', getCollectionById);

// @route   PUT /api/collections/:id
// @desc    Update a collection
// @access  Public
router.put('/:id', updateCollection);

// @route   DELETE /api/collections/:id
// @desc    Delete a collection
// @access  Public
router.delete('/:id', deleteCollection);

module.exports = router; 