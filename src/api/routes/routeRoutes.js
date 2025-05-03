const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

// Add a new route
router.post('/add-route', routeController.addRoute);

// Get all routes
router.get('/get-routes', routeController.getAllRoutes);

// Get route by ID
router.get('/get-route/:routeId', routeController.getRouteById);

// Update route
router.put('/update-route/:routeId', routeController.updateRoute);

// Delete route
router.delete('/delete-route/:routeId', routeController.deleteRoute);

module.exports = router; 