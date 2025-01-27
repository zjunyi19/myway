import React, { useState, useEffect } from 'react';
import styles from './message.module.css';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSocket } from '../../../../contexts/SocketContext';
import { formatTimestamp } from '../../../../utils/dateUtils';
import { convertBase64ToImage } from '../../../../utils/imageUtils';
import SingleChat from './singlechat/SingleChat';
import UserInfo from '../../settings/userinfo/UserInfo';
import axios from 'axios';

const Message = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFriendInfo, setShowFriendInfo] = useState(false);
    const [showSingleChat, setShowSingleChat] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState(null);

    const sortMessages = (messagesData) => {
        if (!Array.isArray(messagesData)) return [];
        
        return [...messagesData].sort((a, b) => {
            // 首先按未读消息数排序
            if (b.unreadCount !== a.unreadCount) {
                return b.unreadCount - a.unreadCount;
            }
            // 然后按最新消息时间排序
            if (a.message && b.message) {
                return new Date(b.message.timestamp) - new Date(a.message.timestamp);
            }
            if (a.message) return -1;
            if (b.message) return 1;
            return 0;
        });
    };

    const handleFriendInfoOpen = (friendId, event) => {
        if (event) {
            event.stopPropagation();
        }
        setSelectedFriendId(friendId);
        setShowFriendInfo(true);
    };

    const handleFriendInfoClose = () => {
        setSelectedFriendId(null);
        setShowFriendInfo(false);
    };

    const handleSingleChatClose = () => {
        setSelectedFriend(null);
        setMessages(messages.map(m => ({ ...m, unreadCount: 0 })));
        setShowSingleChat(false);
        fetchMessages(); // 关闭聊天窗口时只刷新消息列表
    };

    const handleSingleChatOpen = async (friend) => {
        try {
            if (friend.unreadCount > 0) {
                await axios.post(`http://localhost:5001/api/messages/update-to-read/${user.uid}/${friend.firebaseUid}`);
            }
            setSelectedFriend(friend);
            setShowSingleChat(true);
        } catch (error) {
            console.error('Error updating messages to read:', error);
        }
    };

    // 获取好友列表
    const fetchFriends = async () => {
        try {
            setIsLoading(true);
            const friendsResponse = await axios.get(`http://localhost:5001/api/friends/get-friends/${user.uid}`);
            const friendsList = friendsResponse.data.accepted || [];
            setFriends(friendsList);
            fetchMessages(friendsList);
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setIsLoading(false);
        }
    };
            
    // 获取每个好友的最新消息
    const fetchMessages = async (friendsList) => {
        if (!friendsList) return;
        
        try {
            const messagesData = await Promise.all(friendsList.map(async (friend) => {
                const messageResponse = await axios.get(
                    `http://localhost:5001/api/messages/last-message/${user.uid}/${friend.firebaseUid}`
                );
                const { message, count } = messageResponse.data;
                return {
                    firebaseUid: friend.firebaseUid,
                    message: message || null,
                    unreadCount: count || 0
                };
            }));

            setMessages(sortMessages(messagesData));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // 初始化数据获取
    useEffect(() => {
        fetchFriends();
    }, [user]);

    // 监听新消息
    useEffect(() => {
        const handleNewMessage = async (message) => {
            if (message.receiverId === user.uid) {
                // 更新消息列表
                setMessages(prevMessages => {
                    const existingFriendIndex = prevMessages.findIndex(
                        m => m.firebaseUid === message.senderId
                    );

                    if (existingFriendIndex !== -1) {
                        // 更新现有消息
                        const newMessages = [...prevMessages];
                        const existingFriend = newMessages[existingFriendIndex];
                        
                        newMessages[existingFriendIndex] = {
                            ...existingFriend,
                            message: message,
                            unreadCount: existingFriend.unreadCount + 1
                        };
                        
                        return sortMessages(newMessages);
                    } else {
                        // 如果是新好友的消息，获取好友信息
                        const friend = friends.find(f => f.firebaseUid === message.senderId);
                        if (friend) {
                            const newMessage = {
                                ...friend,
                                message: message,
                                unreadCount: 1
                            };
                            return sortMessages([...prevMessages, newMessage]);
                        }
                        return prevMessages;
                    }
                });
            }
        };

        socket.on('receive_message', handleNewMessage);
        
        if (socket.connected) {
            socket.emit('user_connected', user.uid);
        }

        return () => {
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket, user, friends]);

    // 监听好友请求接受
    useEffect(() => {
        if (!socket || !user) return;

        socket.on('friend_request_accepted', () => {
            fetchFriends();
        });

        return () => {
            socket.off('friend_request_accepted');
        };
    }, [socket, user]);

    const renderMessagePreview = (messageData) => {
        const { firebaseUid, message, unreadCount } = messageData;
        const friend = friends.find(f => f.firebaseUid === firebaseUid);
        
        return (
            <div
                key={firebaseUid}
                className={`${styles.messagePreview} ${unreadCount > 0 ? styles.unread : ''}`}
                onClick={() => handleSingleChatOpen(messageData)}
            >
                <div className={styles.friendInfo}>
                    {friend.avatar ? (
                        <img
                            src={convertBase64ToImage(friend.avatar)}
                            alt={friend.username}
                            className={styles.avatar}
                            onClick={(e) => handleFriendInfoOpen(firebaseUid, e)}
                        />
                    ) : (
                        <i 
                            className="fa-solid fa-circle-user"
                            style={{ fontSize: '2rem', color: '#9c9c9c' }}
                            onClick={(e) => handleFriendInfoOpen(firebaseUid, e)}
                        />
                    )}
                    <div className={styles.previewContent}>
                        <div className={styles.previewHeader}>
                            <span className={styles.username}>{friend.username}</span>
                        </div>
                        {message && (
                            <div className={styles.messageInfo}>
                                <p className={styles.lastMessage}>{message.content}</p>
                                <span className={styles.timestamp}>
                                    {formatTimestamp(message.timestamp)}
                                </span>
                                {unreadCount > 0 && (
                                    <span className={styles.unreadBadge}>{unreadCount}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.messageContainer}>
            <h2>Messages</h2>
            <div className={styles.messageList}>
                {isLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : !friends.length ? (
                    <div className={styles.noFriends}>
                        <p>No friends yet. Add some friends to start chatting!</p>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map(renderMessagePreview)
                ) : (
                    <div className={styles.noMessages}>
                        <p>No messages yet.</p>
                    </div>
                )}
            </div>

            {showSingleChat && (
                <SingleChat
                    friend={selectedFriend}
                    onClose={handleSingleChatClose}
                />
            )}
            {showFriendInfo && (
                <UserInfo 
                    userid={selectedFriendId} 
                    onSettingsClose={handleFriendInfoClose} 
                />
            )}
        </div>
    );
};

export default Message;
