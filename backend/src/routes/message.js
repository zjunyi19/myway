const express = require('express');
const router = express.Router();
const Message = require('../models/MessageModel');
const redisService = require('../services/redisService');

// Send a new message
router.post('/send', async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        const message = new Message({
            senderId,
            receiverId,
            content,
            timestamp: new Date(),
            read: false
        });
        await message.save();
        await redisService.cacheMessage(message);

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

router.post('/update-to-read/:userId/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        await Message.updateMany({ senderId: friendId, receiverId: userId, read: false }, { $set: { read: true } });
        const message = await Message.find({ senderId: friendId, receiverId: userId});
        await redisService.clearMessageCache(userId, friendId);
        await redisService.cacheUserLatestMessages(userId, friendId, message);
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error updating messages to read:', error);
        res.status(500).json({ message: 'Error updating messages to read' });
    }
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