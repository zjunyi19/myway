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
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [needUpdate, setNeedUpdate] = useState(false);
    const [showFriendInfo, setShowFriendInfo] = useState(false);
    const [showSingleChat, setShowSingleChat] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState(null);

    const handleFriendInfoOpen = (friendId) => {
        setSelectedFriendId(friendId);
        setShowFriendInfo(true);
    };

    const handleFriendInfoClose = () => {
        setSelectedFriendId(null);
        setShowFriendInfo(false);
    };

    const handleSingleChatClose = () => {
        setSelectedFriend(null);
        setShowSingleChat(false);
        setNeedUpdate(needUpdate ? false : true);
    };

    const handleSingleChatOpen = async (friend, count) => {
        if (count > 0) {
            try {
                await axios.post(`http://localhost:5001/api/messages/update-to-read/${user.uid}/${friend.firebaseUid}`);
            } catch (error) {
                console.error('Error updating messages to read:', error);
            }
        }
        setSelectedFriend(friend);
        setShowSingleChat(true);
    };

    useEffect(() => {
        fetchFriendsAndMessages();
    }, [user, needUpdate]);

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (message) => {
                handleLatestMessage(message);
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [socket, friends]);

    const handleLatestMessage = async (message) => {
        // 如果消息是发给当前用户的
        if (message.receiverId === user.uid) {
            setFriends(prevFriends => {
                const newFriends = prevFriends.map(friend => {
                    if (friend.friend.firebaseUid === message.senderId) {
                        // 如果消息未读，增加未读计数
                        return {
                            ...friend,
                            message: message,
                            unreadCount: message.read ? friend.unreadCount : friend.unreadCount + 1
                        };
                    }
                    return friend;
                });

                // 根据未读消息数和时间戳重新排序
                return newFriends.sort((a, b) => {
                    // 首先按未读消息数排序
                    if (b.unreadCount !== a.unreadCount) {
                        return b.unreadCount - a.unreadCount;
                    }
                    // 然后按最新消息时间排序
                    if (a.message && b.message) {
                        return new Date(b.message.timestamp) - new Date(a.message.timestamp);
                    }
                    return 0;
                });
            });
        }
    };

    const fetchFriends = async () => {
        setIsLoading(true);
        try {
            const friendsResponse = await axios.get(`http://localhost:5001/api/friends/get-friends/${user.uid}`);
            const friendsList = friendsResponse.data.accepted || [];
            setFriends(friendsList);
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFriendsAndMessages = async () => {
        setIsLoading(true);
        try {
            // First, get all friends
            const friendsResponse = await axios.get(`http://localhost:5001/api/friends/get-friends/${user.uid}`);
            // Extract accepted friends from the response
            const friendsList = friendsResponse.data.accepted || [];
            
            // Then get latest messages for each friend
            const friendsWithMessages = await Promise.all(friendsList.map(async (friend) => {
                try {
                    const messageResponse = await axios.get(
                        `http://localhost:5001/api/messages/last-message/${user.uid}/${friend.firebaseUid}`
                    );
                    const { message, count } = messageResponse.data;
                    return {
                        friend: {
                            firebaseUid: friend.firebaseUid,
                            username: friend.username,
                            avatar: friend.avatar
                        },
                        message: message || null,
                        unreadCount: count || 0
                    };
                } catch (error) {
                    console.log('Error fetching messages for friend:', friend, error);
                    return {
                        friend: {
                            firebaseUid: friend.firebaseUid,
                            username: friend.username,
                            avatar: friend.avatar
                        },
                        message: null,
                        unreadCount: 0
                    };
                }
            }));

            // Sort friends: first by unread messages, then by latest message time, then by username
            const sortedFriends = friendsWithMessages.sort((a, b) => {
                // First sort by unread count
                if (b.unreadCount !== a.unreadCount) {
                    return b.unreadCount - a.unreadCount;
                }
                
                // Then sort by message timestamp
                if (a.message && b.message) {
                    return new Date(b.message.timestamp) - new Date(a.message.timestamp);
                }
                
                // Put friends with messages before those without
                if (a.message && !b.message) return -1;
                if (!a.message && b.message) return 1;
                
                // Finally, sort by username
                return a.friend.username.localeCompare(b.friend.username);
            });
            setFriends(sortedFriends);
        } catch (error) {
            console.error('Error fetching friends and messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.messageContainer}>
            <h2>Messages</h2>
            <div className={styles.messageList}>
                {isLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : friends.length === 0 ? (
                    <div className={styles.noFriends}>
                        <p>No friends yet. Add some friends to start chatting!</p>
                    </div>
                ) : (
                    friends.map(({ friend, message, unreadCount }) => (
                            <div
                                key={friend.firebaseUid}
                            className={`${styles.messagePreview} ${unreadCount > 0 ? styles.unread : ''}`}
                            onClick={() => handleSingleChatOpen(friend, unreadCount)}
                        >
                            <div className={styles.friendInfo}>
                                {friend.avatar ? (
                                    <img
                                        src={convertBase64ToImage(friend.avatar)}
                                        alt={friend.username}
                                        className={styles.avatar}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleFriendInfoOpen(friend.firebaseUid);
                                        }}
                                    />
                                ) : (
                                    <i className="fa-solid fa-circle-user"
                                        style={{ fontSize: '2rem', color: '#9c9c9c' }}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleFriendInfoOpen(friend.firebaseUid);
                                        }}
                                    ></i>
                                )}
                                <div className={styles.previewContent}>
                                    <div className={styles.previewHeader}>
                                        <span className={styles.username}>{friend.username}</span>
                                    </div>
                                    {message && (
                                        <div className={styles.messageInfo}>
                                            <p className={styles.lastMessage}>
                                                {message.content}
                                            </p>
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
                    ))
                )}
            </div>

            {showSingleChat && (
                <SingleChat
                    friend={selectedFriend}
                    onClose={handleSingleChatClose}
                />
            )}
            {showFriendInfo && <UserInfo userid={selectedFriendId} onSettingsClose={handleFriendInfoClose} />}
        </div>
    );
};

export default Message;
