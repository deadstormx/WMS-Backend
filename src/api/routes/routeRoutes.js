const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { protect } = require('../../middleware/auth');

// Add a new route
router.post('/add-route', protect, routeController.addRoute);

// Get all routes
router.get('/get-routes', routeController.getAllRoutes);

// Get route by ID
router.get('/get-route/:routeId', protect, routeController.getRouteById);

// Update route
router.put('/update-route/:routeId', protect, routeController.updateRoute);

// Start route
router.post('/start-route/:routeId', protect, routeController.startRoute);

// Delete route
router.delete('/delete-route/:routeId', protect, routeController.deleteRoute);

module.exports = router; 