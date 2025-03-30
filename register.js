const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const userRoutes = require('./src/routes/userRoutes');
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
    app.use('/api', userRoutes());

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

initialize();
