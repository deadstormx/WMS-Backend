const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming your user model path

const ADMIN_EMAIL = 'greenbinpvtltd@gmail.com';

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
      console.log('Decoded token:', decoded);

      // Get user from the token payload (assuming payload contains user id)
      // Select '-password' to exclude the password field
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Found user:', req.user);

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Restrict access to route and collection APIs to only the specified admin
      const isRouteOrCollection =
        req.originalUrl.startsWith('/api/collections') ||
        req.originalUrl.startsWith('/api/route');
      
      if (isRouteOrCollection) {
        console.log('Checking admin access:');
        console.log('User email:', req.user.email);
        console.log('Admin email:', ADMIN_EMAIL);
        console.log('Is admin?', req.user.email === ADMIN_EMAIL);
        
        if (req.user.email !== ADMIN_EMAIL) {
          return res.status(403).json({ 
            message: 'Not authorized, admin access required',
            debug: {
              userEmail: req.user.email,
              adminEmail: ADMIN_vEMAIL
            }
          });
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

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, admin access required' });
  }
};

module.exports = { protect, isAdmin };
