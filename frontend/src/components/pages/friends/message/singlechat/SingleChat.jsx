import React, { useState, useEffect, useRef } from 'react';
import styles from './singlechat.module.css';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useSocket } from '../../../../../contexts/SocketContext';
import { formatTimestamp } from '../../../../../utils/dateUtils';
import axios from 'axios';
import { convertBase64ToImage } from '../../../../../utils/imageUtils';
import { IoClose } from 'react-icons/io5';
import UserInfo from '../../../settings/userinfo/UserInfo';

const SingleChat = ({ friend, onClose }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [conversation, setConversation] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const handleClickOverlay = (e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
    };

    const handleUserInfoOpen = (friend) => {
        setSelectedFriend(friend.firebaseUid);
        setShowUserInfo(true);
    };

    const handleUserInfoClose = () => {
        setShowUserInfo(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversation = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/messages/conversation/${user.uid}/${friend.firebaseUid}`);
            console.log(response.data);
            const messages = response.data.map(msg => JSON.parse(msg));
            console.log("messages", messages);
            messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setConversation(messages);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    useEffect(() => {
        fetchConversation();
        // 进入聊天时通知服务器
        if (socket) {
            socket.emit('enter_chat', {
                userId: user.uid,
                friendId: friend.firebaseUid
            });
        }
        // 组件卸载时通知服务器离开聊天
        return () => {
            if (socket) {
                socket.emit('leave_chat', {
                    userId: user.uid
                });
            }
        };
    }, [friend, socket]);

    useEffect(() => {
        if (socket) {
            // 监听接收到的新消息
            socket.on('receive_message', (message) => {
                if (message.senderId === friend.firebaseUid) {
                    setConversation(prev => [...prev, message]);
                    scrollToBottom();
                }
            });

            // 监听对方正在输入
            socket.on('typing_start', ({ senderId }) => {
                if (senderId === friend.firebaseUid) {
                    setIsTyping(true);
                }
            });

            // 监听对方停止输入
            socket.on('typing_stop', ({ senderId }) => {
                if (senderId === friend.firebaseUid) {
                    setIsTyping(false);
                }
            });

            return () => {
                socket.off('receive_message');
                socket.off('typing_start');
                socket.off('typing_stop');
            };
        }
    }, [socket, friend]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            senderId: user.uid,
            receiverId: friend.firebaseUid,
            content: newMessage,
            timestamp: new Date(),
            read: false
        };

        socket.emit('send_message', messageData);
        setConversation(prev => [...prev, messageData]);
        setNewMessage('');
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (socket) {
            socket.emit('typing_start', {
                senderId: user.uid,
                receiverId: friend.firebaseUid
            });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing_stop', {
                    senderId: user.uid,
                    receiverId: friend.firebaseUid
                });
            }, 1000);
        }
    };

    return ( 
        <div className={styles.overlay} onClick={handleClickOverlay}>
            <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                    <div className={styles.friendInfo}>
                        {friend.avatar ? (
                            <img 
                                src={convertBase64ToImage(friend.avatar)} 
                                alt={friend.username} 
                                className={styles.avatar}
                                onClick={() => handleUserInfoOpen(friend)}
                            />
                        ) : (
                            <i className="fa-solid fa-circle-user"
                                style={{ fontSize: '2rem', color: '#9c9c9c' }}
                                onClick={() => handleUserInfoOpen(friend)}
                            ></i>
                        )}
                        <span className={styles.username}>{friend.username}</span>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className={styles.messagesContainer}>
                    {conversation.map((message) => (
                        <div 
                            key={message._id}
                            className={`${styles.message} ${
                                message.senderId === user.uid ? styles.sent : styles.received
                            }`}
                        >
                            <div className={styles.messageContent}>
                                <p>{message.content}</p>
                                <span className={styles.timestamp}>
                                    {formatTimestamp(message.timestamp)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className={styles.typingIndicator}>
                            {friend.username} is typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.messageForm} onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className={styles.messageInput}
                    />
                    <button type="submit" className={styles.sendButton}>
                        Send
                    </button>
                </form>
            </div>
            {showUserInfo && <UserInfo userid={selectedFriend} onSettingsClose={handleUserInfoClose} />}
        </div>
    );
};

export default SingleChat;
