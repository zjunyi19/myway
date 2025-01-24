const redisClient = require('../config/redis');

const CACHE_DURATION = 3600; // 1 hour in seconds
const MESSAGE_CACHE_PREFIX = 'msg:';
const USER_ONLINE_PREFIX = 'user:online:';
const UNREAD_COUNT_PREFIX = 'unread:count:';
const LAST_UNREAD_PREFIX = 'unread:last:';

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
        
        if (Array.isArray(messages)) {
            // If it's an array of messages
            const messageStrings = messages.map(msg => JSON.stringify(msg));
            await redisClient.sadd(key, ...messageStrings);
        } else {
            // If it's a single message
            await redisClient.sadd(key, JSON.stringify(messages));
        }
        
        await redisClient.expire(key, CACHE_DURATION);
    },

    // Get user's cached latest messages
    async getMessages(senderId, receiverId) {
        const key = `${MESSAGE_CACHE_PREFIX}${senderId}:${receiverId}`;
        return await redisClient.smembers(key);
    },

    // 未读消息计数相关方法
    async incrementUnreadMessageCount(senderId, receiverId) {
        const key = `${UNREAD_COUNT_PREFIX}${senderId}:${receiverId}`;
        await redisClient.incr(key);
        await redisClient.expire(key, CACHE_DURATION);
    },
    
    async cacheUnreadMessageCount(senderId, receiverId, count) {
        const key = `${UNREAD_COUNT_PREFIX}${senderId}:${receiverId}`;
        await redisClient.set(key, count);
        await redisClient.expire(key, CACHE_DURATION);
    },

    async getUnreadMessageCount(senderId, receiverId) {
        const key = `${UNREAD_COUNT_PREFIX}${senderId}:${receiverId}`;
        const count = await redisClient.get(key);
        return count ? parseInt(count) : -1;
    },

    async clearUnreadMessageCount(userId, friendId) {
        const key = `${UNREAD_COUNT_PREFIX}${friendId}:${userId}`;
        await redisClient.del(key);
    },

    // 最后一条未读消息相关方法
    async cacheLastMessage(senderId, receiverId, message) {
        let key = null;
        if (senderId < receiverId) {
            key = `${LAST_UNREAD_PREFIX}${senderId}:${receiverId}`;
        } else {
            key = `${LAST_UNREAD_PREFIX}${receiverId}:${senderId}`;
        }
        await redisClient.set(key, JSON.stringify(message));
        await redisClient.expire(key, CACHE_DURATION);
    },

    async getLastMessage(senderId, receiverId) {
        let key = null;
        if (senderId < receiverId) {
            key = `${LAST_UNREAD_PREFIX}${senderId}:${receiverId}`;
        } else {
            key = `${LAST_UNREAD_PREFIX}${receiverId}:${senderId}`;
        }
        const message = await redisClient.get(key);
        return message ? JSON.parse(message) : null;
    },

    async clearLastMessage(userId, friendId) {
        let key = null;
        if (userId < friendId) {
            key = `${LAST_UNREAD_PREFIX}${friendId}:${userId}`;
        } else {
            key = `${LAST_UNREAD_PREFIX}${userId}:${friendId}`;
        }
        await redisClient.del(key);
    },

    // 用户在线状态相关方法
    async setUserOnline(userId) {
        await redisClient.set(`${USER_ONLINE_PREFIX}${userId}`, 'online');
        await redisClient.expire(`${USER_ONLINE_PREFIX}${userId}`, CACHE_DURATION);
    },

    async setUserOffline(userId) {
        await redisClient.del(`${USER_ONLINE_PREFIX}${userId}`);
    },

    async isUserOnline(userId) {
        const status = await redisClient.get(`${USER_ONLINE_PREFIX}${userId}`);
        return status === 'online';
    }
};

module.exports = redisService; 