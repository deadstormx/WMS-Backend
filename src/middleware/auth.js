const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming your user model path

const ADMIN_EMAIL = 'greenbinpvtltd@gmail.com';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTY0YzY3N2Y0MTQ0MmJmMWY2NmU0OCIsImlhdCI6MTc0NjI5MTg3NCwiZXhwIjoxNzQ4ODgzODc0fQ.RnHnhrrQ3APBEaA7qSPNpVutXsUo89A4SeAAXqUubSU';

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (remove 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (assuming payload contains user id)
      // Select '-password' to exclude the password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Restrict access to route and collection APIs to only the specified admin
      const isRouteOrCollection =
        req.originalUrl.startsWith('/api/collections') ||
        req.originalUrl.startsWith('/api/route');
      if (isRouteOrCollection) {
        if (
          req.user.email !== ADMIN_EMAIL ||
          token !== ADMIN_TOKEN
        ) {
          return res.status(403).json({ message: 'Not authorized, admin access required' });
        }
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
