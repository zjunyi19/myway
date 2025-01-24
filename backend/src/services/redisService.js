const redisClient = require('../config/redis');

const CACHE_DURATION = 3600; // 1 hour in seconds
const MESSAGE_CACHE_PREFIX = 'msg:';
const USER_ONLINE_PREFIX = 'user:online:';

const redisService = {
    // Clear all message keys
    async clearAllMessageKeys() {
        const keys = await redisClient.keys(`${MESSAGE_CACHE_PREFIX}*`);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    },

    // Cache a message
    async cacheMessage(message) {
        const redisKey = `${MESSAGE_CACHE_PREFIX}${message.senderId}:${message.receiverId}`;
        await redisClient.sadd(redisKey, JSON.stringify(message));
        await redisClient.expire(redisKey, CACHE_DURATION);
    },

    // Cache user's latest messages
    async cacheUserLatestMessages(senderId, receiverId, messages) {
        const key = `${MESSAGE_CACHE_PREFIX}${senderId}:${receiverId}`;
        await redisClient.sadd(key, ...messages.map(msg => JSON.stringify(msg)));
        await redisClient.expire(key, CACHE_DURATION);
    },

    // Get user's cached latest messages
    async getMessages(senderId, receiverId) {
        const key = `${MESSAGE_CACHE_PREFIX}${senderId}:${receiverId}`;
        const messages = await redisClient.smembers(key);
        return messages;
    },

    // Clear user's cached data
    async clearMessageCache(userId, friendId) {
        const keys = `${MESSAGE_CACHE_PREFIX}${friendId}:${userId}`;
        await redisClient.del(keys);
    }
};

module.exports = redisService; 