const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = "mongodb+srv://shresthaniranjan0:44x3EyPIUjy395uF@cluster0.jznyv.mongodb.net/greenbin?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
