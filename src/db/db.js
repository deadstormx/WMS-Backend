const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://shresthaniranjan0:44x3EyPIUjy395uF@cluster0.jznyv.mongodb.net/greenbin?retryWrites=true&w=majority";
const dbName = 'greenbin';

const client = new MongoClient(uri, { tlsAllowInvalidCertificates: true });

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    console.log("Connected to database:", client.db(dbName).databaseName);
    return client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    console.error("Connection URI:", uri);
    console.error("Database Name:", dbName);
    throw error;
  }
}

module.exports = { connectDB, client };
