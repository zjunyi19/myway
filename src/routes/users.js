const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');

router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, username, firstName, lastName } = req.body;

    // Create new user and save to database
    const user = new User({
      firebaseUid,
      username,
      firstName,
      lastName,
    });
    
    await user.save();
    console.log('User saved successfully:', user);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    console.log('Checking username:', username);
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    res.status(200).json({ message: 'Username is available' });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ message: 'Error checking username availability' });
  }
});

// 获取用户信息
router.get('/profile/:firebaseUid', async (req, res) => {
  try {

    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        requestedId: req.params.firebaseUid 
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

module.exports = router; 