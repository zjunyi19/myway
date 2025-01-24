import React, { useState, useEffect, useRef } from 'react';
import styles from './singlechat.module.css';
import { useAuth } from '../../../../../contexts/AuthContext';
import { formatTimestamp } from '../../../../../utils/dateUtils';
import { convertBase64ToImage } from '../../../../../utils/imageUtils';
import { IoClose } from 'react-icons/io5';
import UserInfo from '../../../settings/userinfo/UserInfo';
import axios from 'axios';

const SingleChat = ({ friend, onClose }) => {
    const { user } = useAuth();
    const [conversation, setConversation] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const messagesEndRef = useRef(null);

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

    useEffect(() => {
        fetchConversation();
        //const interval = setInterval(fetchConversation, 5000); // Poll every 5 seconds
        //return () => clearInterval(interval);
    }, [friend, user]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const fetchConversation = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/messages/conversation/${user.uid}/${friend.firebaseUid}`);
            const messages = response.data.map(msg => JSON.parse(msg));
            messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setConversation(messages);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage) return;

        try {
            await axios.post(`http://localhost:5001/api/messages/send`, {
                senderId: user.uid,
                receiverId: friend.firebaseUid,
                content: newMessage
            });
            fetchConversation();
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
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
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.messageForm} onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={styles.messageInput}
                        autoFocus
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
