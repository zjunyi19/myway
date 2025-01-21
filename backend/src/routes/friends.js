const express = require('express');
const router = express.Router();
const Friend = require('../models/FriendModel');
const User = require('../models/UserModel');

// Add friend
router.post('/addFriend', async (req, res) => {
  const { firebaseUidA, firebaseUidB, status } = req.body;
  try {

    const friend = new Friend({ 
      firebaseUidA, 
      firebaseUidB, 
      status,
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
    res.json({ friendship });
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
    let pendingIds = friendships.filter(friendship => friendship.status === 'pending' && friendship.firebaseUidB === firebaseUid);
    let acceptedIds = friendships.filter(friendship => friendship.status === 'accepted');

    // Extract friend IDs
    pendingIds = pendingIds.map(pendingId => pendingId.firebaseUidA);
    acceptedIds = acceptedIds.map(acceptedId => acceptedId.firebaseUidA === firebaseUid ? acceptedId.firebaseUidB : acceptedId.firebaseUidA);

    const pendingFriends = await User.find({
      firebaseUid: pendingIds }
    ).select('firebaseUid username avatar score');

    const acceptedFriends = await User.find({
      firebaseUid: acceptedIds }
    ).select('firebaseUid username avatar score');

    res.json({ pending: pendingFriends, accepted: acceptedFriends });
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

// Update friend status
router.put('/update-status', async (req, res) => {
  const { userUid, friendUid, status } = req.body;
  try {
    const friendship = await Friend.findOne({
      $or: [
        { firebaseUidA: userUid, firebaseUidB: friendUid },
        { firebaseUidA: friendUid, firebaseUidB: userUid }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    friendship.status = status;
    await friendship.save();

    res.json({ message: 'Friendship status updated successfully' });
  } catch (error) {
    console.error('Error updating friendship status:', error);
    res.status(500).json({ message: 'Error updating friendship status' });
  }
});

module.exports = router;