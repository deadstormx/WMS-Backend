const express = require('express');
const app = express();
const port = 3000;
const userRoutes = require('./src/routes/userRoutes');
const { connectDB } = require('./src/db/db');

app.use(express.json());
app.use(express.static(__dirname)); // Add this line

async function initialize() {
  try {
    const db = await connectDB();
    app.use('/api', userRoutes(db));

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

initialize();
