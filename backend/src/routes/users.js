const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

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
      avatar: null,
      score: 0,
    });
    
    await user.save();
    
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

// Check user credentials
router.post('/check-credentials', async (req, res) => {
  try {
    // Since we're using Firebase Auth, we just need to validate the token
    // This endpoint can be used for additional user validation if needed
    res.json({ valid: true });
  } catch (error) {
    res.status(400).json('Error: ' + error);
  }
});

router.post('/upload-avatar/:firebaseUid', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { firebaseUid } = req.params;
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await user.save();

    // Send back the processed image data
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar: {
        data: req.file.buffer,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
}); 

module.exports = router; 