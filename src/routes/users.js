const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');

router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, username, email, firstName, lastName } = req.body;

    // Create new user and save to database
    const user = new User({
      firebaseUid,
      username,
      email,
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

// 合并检查用户名和邮箱
router.post('/check-credentials', async (req, res) => {
  try {
    const { username, email } = req.body;
    console.log('Checking credentials:', { username, email });
    
    // 同时检查用户名和邮箱
    const [usernameExists, emailExists] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email })
    ]);

    if (usernameExists && emailExists) {
      return res.status(400).json({ message: 'Both username and email already exist' });
    }
    
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(200).json({ message: 'Username and email are available' });
  } catch (error) {
    console.error('Credentials check error:', error);
    res.status(500).json({ message: 'Error checking credentials availability' });
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