const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    data: Buffer,
    contentType: String
  },
  score: {
    type: Number,
    default: 0,
  },
}, {
  collection: "Users"
});

module.exports = mongoose.model("Users", UserSchema);