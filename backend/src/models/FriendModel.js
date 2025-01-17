const mongoose = require('mongoose');

// Friend Schema
const friendSchema = new mongoose.Schema({
  firebaseUidA: {
    type: String,
    ref: 'User',
    required: true,
  },
  firebaseUidB: {
    type: String,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
}, {
  collection: "Friends"
});

// Create compound index for faster friendship lookups
friendSchema.index({ firebaseUidA: 1, firebaseUidB: 1 }, { unique: true });

module.exports = mongoose.model('Friends', friendSchema);