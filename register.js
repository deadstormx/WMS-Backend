const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const userRoutes = require('./src/api/routes/users');
const authRoutes = require('./src/api/routes/auth'); // Import auth routes
const pickupRoutes = require('./src/api/routes/pickups'); // Import user pickup routes
const pickupAdminRoutes = require('./src/api/routes/admin/pickups'); // Import admin pickup routes
const collectionRoutes = require('./src/api/routes/collections'); // Import collection routes
const routeRoutes = require('./src/api/routes/routeRoutes'); // Import route routes
const connectDB = require('./src/db/db');
const requestLogger = require('./src/middleware/requestLogger');
const User = require('./src/models/User'); // Import User model
require('dotenv').config();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(requestLogger);
app.use(express.static(__dirname + '/src/utils')); // Add this line

// Function to create default admin user if not exists
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@556';
    const adminPassword = 'adminpower'; // Use a strong password in production!

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = new User({
        fullName: 'Admin User', // Default name
        email: adminEmail,
        password: adminPassword,
        role: 'admin', // Set role to admin
      });
      await adminUser.save();
      console.log('Default admin user created successfully.');
    } else {
      console.log('Default admin user already exists.');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
};

async function initialize() {
  try {
    await connectDB();
    await createDefaultAdmin(); // Create default admin after DB connection

    app.use('/api/users', userRoutes()); // Mount user routes (register)
    app.use('/api/auth', authRoutes()); // Mount auth routes (login, logout)
    app.use('/api/pickups', pickupRoutes); // Mount user pickup routes
    app.use('/api/admin/pickups', pickupAdminRoutes); // Mount admin pickup routes
    app.use('/api/collections', collectionRoutes); // Mount collection routes
    app.use('/api', routeRoutes); // Mount route routes

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

initialize();
