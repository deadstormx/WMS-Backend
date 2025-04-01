const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes'); // Import auth routes
const pickupRoutes = require('./src/routes/pickupRoutes'); // Import user pickup routes
const pickupAdminRoutes = require('./src/routes/admin/pickupAdminRoutes'); // Import admin pickup routes
const connectDB = require('./src/db/db');
const requestLogger = require('./src/middlewares/requestLogger');
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

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

initialize();
