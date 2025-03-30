const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const userRoutes = require('./src/routes/userRoutes');
<<<<<<< HEAD
const pickupRoutes = require('./src/routes/pickupRoutes'); // Import pickup routes
=======
>>>>>>> 1ec063542ccd04f3ac4fc7a15f31fe1dcc7cd9ac
const connectDB = require('./src/db/db');
const requestLogger = require('./src/middlewares/requestLogger');
require('dotenv').config();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(requestLogger);
app.use(express.static(__dirname + '/src/utils')); // Add this line

async function initialize() {
  try {
    await connectDB();
<<<<<<< HEAD
    app.use('/api/users', userRoutes()); // Assuming user routes are under /api/users
    app.use('/api/pickups', pickupRoutes); // Use pickup routes under /api/pickups
=======
    app.use('/api', userRoutes());
>>>>>>> 1ec063542ccd04f3ac4fc7a15f31fe1dcc7cd9ac

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

initialize();
