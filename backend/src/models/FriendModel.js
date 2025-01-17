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

module.exports = mongoose.model('Friends', completionSchema);