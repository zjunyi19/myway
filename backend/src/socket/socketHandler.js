const Message = require('../models/MessageModel');
const redisService = require('../services/redisService');

const socketHandler = (io) => {
    // 存储用户ID和socket.id的映射
    const userSocketMap = new Map();
    // 存储用户当前正在查看的聊天对象
    const userCurrentChat = new Map();

    io.on('connection', (socket) => {
        socket.on('user_connected', (userId) => {
            console.log('User connected:', userId);
            redisService.setUserOnline(userId);
            socket.userId = userId;
            userSocketMap.set(userId, socket.id);
        });

        // 用户进入某个聊天
        socket.on('enter_chat', async ({ userId, friendId }) => {
            userCurrentChat.set(userId, friendId);
            // 更新所有未读消息为已读
            await Message.updateMany(
                { senderId: friendId, receiverId: userId, read: false },
                { $set: { read: true } }
            );
            // 清除未读消息计数
            await redisService.clearUnreadMessageCount(userId, friendId);
        });

        // 用户离开聊天
        socket.on('leave_chat', ({ userId }) => {
            userCurrentChat.delete(userId);
        });

        socket.on('send_message', async (messageInput) => {
            try {
                const isReceiverInChat = userCurrentChat.get(messageInput.receiverId) === messageInput.senderId;
                
                // 保存消息到数据库
                const message = new Message({
                    senderId: messageInput.senderId,
                    receiverId: messageInput.receiverId,
                    content: messageInput.content,
                    timestamp: messageInput.timestamp,
                    read: isReceiverInChat // 如果接收者正在查看这个聊天，则标记为已读
                });
                await message.save();
                
                // 如果接收者不在聊天框中，更新未读消息缓存
                if (!isReceiverInChat) {
                    await redisService.incrementUnreadMessageCount(messageInput.senderId, messageInput.receiverId);
                }
                console.log("here")
                await redisService.cacheLastMessage(messageInput.senderId, messageInput.receiverId, message);
                await redisService.cacheUserLatestMessages(messageInput.senderId, messageInput.receiverId, message);
                
                // 获取接收者的socket id
                const receiverSocketId = userSocketMap.get(messageInput.receiverId);
                if (receiverSocketId) {
                    // 只发送给接收者
                    io.to(receiverSocketId).emit('receive_message', message);
                }
                // 也发送给发送者（为了在多个标签页中同步）
                socket.emit('receive_message', message);
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        socket.on('typing_start', (data) => {
            const receiverSocketId = userSocketMap.get(data.receiverId);
            if (receiverSocketId) {
                // 只发送给特定的接收者
                io.to(receiverSocketId).emit('typing_start', data);
            }
        });

        socket.on('typing_stop', (data) => {
            const receiverSocketId = userSocketMap.get(data.receiverId);
            if (receiverSocketId) {
                // 只发送给特定的接收者
                io.to(receiverSocketId).emit('typing_stop', data);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (socket.userId) {
                redisService.setUserOffline(socket.userId);
                userSocketMap.delete(socket.userId);
                userCurrentChat.delete(socket.userId);
            }
        });
    });
};

module.exports = socketHandler; 