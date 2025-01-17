const express = require('express');
const router = express.Router();
const Friend = require('../models/FriendModel');
const User = require('../models/UserModel');

// Add friend
router.post('/addFriend', async (req, res) => {
  const { firebaseUidA, firebaseUidB } = req.body;
  try {
    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { firebaseUidA, firebaseUidB },
        { firebaseUidA: firebaseUidB, firebaseUidB: firebaseUidA }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    const friend = new Friend({ 
      firebaseUidA, 
      firebaseUidB, 
      date: new Date() 
    });
    await friend.save();
    res.status(201).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Error adding friend' });
  }
});

// Check if two users are friends
router.post('/check-friendship', async (req, res) => {
  const { userUid, friendUid } = req.body;
  try {
    const friendship = await Friend.findOne({
      $or: [
        { firebaseUidA: userUid, firebaseUidB: friendUid },
        { firebaseUidA: friendUid, firebaseUidB: userUid }
      ]
    });
    res.json({ isFriend: !!friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error checking friendship status' });
  }
});

// Get all friends of a user
router.get('/get-friends/:firebaseUid', async (req, res) => {
  const { firebaseUid } = req.params;
  try {
    // Find all friendships where the user is either A or B
    const friendships = await Friend.find({
      $or: [
        { firebaseUidA: firebaseUid },
        { firebaseUidB: firebaseUid }
      ]
    });

    // Extract friend IDs
    const friendIds = friendships.map(friendship => 
      friendship.firebaseUidA === firebaseUid ? 
        friendship.firebaseUidB : 
        friendship.firebaseUidA
    );

    // Get friend details from User model
    const friends = await User.find({
      firebaseUid: { $in: friendIds }
    }).select('firebaseUid username avatar score');

    res.json(friends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ message: 'Error getting friends' });
  }
});

// Remove friend
router.delete('/remove-friend', async (req, res) => {
  const { userUid, friendUid } = req.body;
  try {
    await Friend.findOneAndDelete({
      $or: [
        { firebaseUidA: userUid, firebaseUidB: friendUid },
        { firebaseUidA: friendUid, firebaseUidB: userUid }
      ]
    });
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend' });
  }
});

module.exports = router;