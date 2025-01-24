const express = require('express');
const router = express.Router();
const Message = require('../models/MessageModel');
const redisService = require('../services/redisService');

router.post('/update-to-read/:userId/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        await Message.updateMany({ senderId: friendId, receiverId: userId, read: false }, { $set: { read: true } });
        const message = await Message.find({ senderId: friendId, receiverId: userId});
        await redisService.clearUnreadMessageCount(userId, friendId);
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error updating messages to read:', error);
        res.status(500).json({ message: 'Error updating messages to read' });
    }
});

router.get('/last-message/:userId/:friendId', async (req, res) => {
    await redisService.clearAllMessageKeys();
    const { userId, friendId } = req.params;
    let message = null;
    let count = null;
    message = await redisService.getLastMessage(friendId, userId);
    count = await redisService.getUnreadMessageCount(friendId, userId);
    if (!message || count === -1) {
        message = await Message.find({ senderId: friendId, receiverId: userId})
        count = message.filter(msg => msg.read === false).length;
        message = message.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        await redisService.cacheLastMessage(friendId, userId, message);
        await redisService.cacheUnreadMessageCount(friendId, userId, count);
    }
    res.json({ message, count });
});


// Get conversation with a specific friend
router.get('/conversation/:userId/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        // Try to get from cache first
        const cachedMessages1 = await redisService.getMessages(userId, friendId);
        const cachedMessages2 = await redisService.getMessages(friendId, userId);
        const cachedMessages = [...cachedMessages1, ...cachedMessages2];
        if (cachedMessages.length > 0) {
            return res.json(cachedMessages);
        }
        
        // If not in cache, get from database
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        }).sort({ timestamp: -1 });
        const messagesSent = messages.filter(msg => msg.senderId === userId);
        const messagesReceived = messages.filter(msg => msg.receiverId === userId);

        // Cache the result
        if (messagesSent.length > 0) {
            await redisService.cacheUserLatestMessages(userId, friendId, messagesSent);
        }
        if (messagesReceived.length > 0) {
            await redisService.cacheUserLatestMessages(friendId, userId, messagesReceived);
        }
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Error fetching conversation' });
    }
});


module.exports = router;