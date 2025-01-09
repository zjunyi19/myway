const mongoose = require('mongoose');
require('dotenv').config({ path: "./config.env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('MongoDB Atlas connected successfully');
    console.log('Connected to database:', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
