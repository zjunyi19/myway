const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config.env') });

const connectDB = async () => {
  try {
    if (!process.env.ATLAS_URI) {
      throw new Error('ATLAS_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('MongoDB Atlas connected successfully');
    console.log('Connected to database:', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
