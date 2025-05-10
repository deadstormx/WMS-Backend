const Route = require('../../models/Route');

// Add a new route
exports.addRoute = async (req, res) => {
    try {
        const { routeId, routeName, status } = req.body;

        // Check if route with same ID already exists
        const existingRoute = await Route.findOne({ routeId });
        if (existingRoute) {
            return res.status(400).json({
                success: false,
                message: 'Route with this ID already exists'
            });
        }

        const route = new Route({
            routeId,
            routeName,
            status: status || 'No Schedule'
        });

        await route.save();

        res.status(201).json({
            success: true,
            message: 'Route added successfully',
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding route',
            error: error.message
        });
    }
};

// Get all routes
exports.getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: routes.length,
            data: routes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching routes',
            error: error.message
        });
    }
};

// Get route by ID
exports.getRouteById = async (req, res) => {
    try {
        const route = await Route.findOne({ routeId: req.params.routeId });
        
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.status(200).json({
            success: true,
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching route',
            error: error.message
        });
    }
};

// Update route
exports.updateRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { newRouteId, routeName, status } = req.body;

        // If changing routeId, check if new ID already exists
        if (newRouteId && newRouteId !== routeId) {
            const existingRoute = await Route.findOne({ routeId: newRouteId });
            if (existingRoute) {
                return res.status(400).json({
                    success: false,
                    message: 'Route with this ID already exists'
                });
            }
        }

        // Find and update the route
        const route = await Route.findOneAndUpdate(
            { routeId },
            { 
                routeId: newRouteId || routeId,
                routeName,
                status,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Route updated successfully',
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating route',
            error: error.message
        });
    }
};

// Start route
exports.startRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        // Find the route
        const route = await Route.findOne({ routeId });
        
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Check if route is in Scheduled status
        if (route.status !== 'Scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Only scheduled routes can be started'
            });
        }

        // Update route status to In Progress
        route.status = 'In Progress';
        route.updatedAt = new Date();
        await route.save();

        res.status(200).json({
            success: true,
            message: 'Route started successfully',
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting route',
            error: error.message
        });
    }
};

// Delete route
exports.deleteRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        const route = await Route.findOneAndDelete({ routeId });

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Route deleted successfully',
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting route',
            error: error.message
        });
    }
}; 