const Message = require('../models/MessageModel');
const redisService = require('../services/redisService');

const socketHandler = (io) => {
    // 存储用户ID和socket.id的映射
    const userSocketMap = new Map();
    // 存储用户当前正在查看的聊天对象
    const userCurrentChat = new Map();

    const handleUserConnection = async (socket, userId) => {
        console.log('User connected:', userId);
        await redisService.setUserOnline(userId);
        socket.userId = userId;
        userSocketMap.set(userId, socket.id);
    };

    const handleUserDisconnection = async (socket) => {
        console.log('User disconnected:', socket.userId);
        if (socket.userId) {
            await redisService.setUserOffline(socket.userId);
            userSocketMap.delete(socket.userId);
            userCurrentChat.delete(socket.userId);
        }
    };

    io.on('connection', (socket) => {
        console.log('New socket connection:', socket.id);

        socket.on('user_connected', async (userId) => {
            await handleUserConnection(socket, userId);
        });

        // 处理好友请求发送
        socket.on('friend_request_sent', ({ fromUserId, toUserId }) => {
            console.log('Friend request sent:', { fromUserId, toUserId });
            const receiverSocketId = userSocketMap.get(toUserId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('friend_request_received');
            }
        });

        // 处理好友请求接受
        socket.on('friend_request_accepted', ({ fromUserId, toUserId }) => {
            console.log('Friend request accepted:', { fromUserId, toUserId });
            const senderSocketId = userSocketMap.get(toUserId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('friend_request_accepted');
            }
        });

        // 用户进入某个聊天
        socket.on('enter_chat', async ({ userId, friendId }) => {
            try {
                userCurrentChat.set(userId, friendId);
                // 更新所有未读消息为已读
                await Message.updateMany(
                    { senderId: friendId, receiverId: userId, read: false },
                    { $set: { read: true } }
                );
                // 清除未读消息计数
                await redisService.clearUnreadMessageCount(userId, friendId);
            } catch (error) {
                console.error('Error in enter_chat:', error);
            }
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
                    read: isReceiverInChat
                });
                await message.save();
                
                // 如果接收者不在聊天框中，更新未读消息缓存
                if (!isReceiverInChat) {
                    await redisService.incrementUnreadMessageCount(messageInput.senderId, messageInput.receiverId);
                }
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
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        socket.on('typing_start', (data) => {
            const receiverSocketId = userSocketMap.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing_start', data);
            }
        });

        socket.on('typing_stop', (data) => {
            const receiverSocketId = userSocketMap.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing_stop', data);
            }
        });

        socket.on('disconnect', async () => {
            await handleUserDisconnection(socket);
        });

        // 处理错误
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    // 定期清理断开连接的用户
    setInterval(async () => {
        for (const [userId, socketId] of userSocketMap) {
            const socket = io.sockets.sockets.get(socketId);
            if (!socket || !socket.connected) {
                await redisService.setUserOffline(userId);
                userSocketMap.delete(userId);
                userCurrentChat.delete(userId);
            }
        }
    }, 30000); // 每30秒检查一次
};

module.exports = socketHandler; 