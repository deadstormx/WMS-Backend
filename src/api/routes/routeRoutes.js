const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { protect } = require('../../middleware/auth');

// Add a new route
router.post('/route/add-route', protect, routeController.addRoute);

// Get all routes
router.get('/route/get-routes', protect, routeController.getAllRoutes);

// Get route by ID
router.get('/route/get-route/:routeId', protect, routeController.getRouteById);

// Update route
router.put('/route/update-route/:routeId', protect, routeController.updateRoute);

// Delete route
router.delete('/route/delete-route/:routeId', protect, routeController.deleteRoute);

module.exports = router; 