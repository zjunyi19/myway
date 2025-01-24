import React, { useState } from 'react';
import styles from './friendsmain.module.css';
import { IoClose } from 'react-icons/io5';
import Ranking from './ranking/Ranking';
import Message from './message/Message';
import FriendRequests from './friendrequests/FriendRequests';
import AddFriend from './addfriend/AddFriend';

export default function FriendsMain({ onFriendsClose }) {
    const [activeTab, setActiveTab] = useState('message');
    const [friends, setFriends] = useState({ accepted: [], pending: [] });

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onFriendsClose();
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'message' ? styles.active : ''}`}
                            onClick={() => handleTabClick('message')}
                        >
                            Messages
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'ranking' ? styles.active : ''}`}
                            onClick={() => handleTabClick('ranking')}
                        >
                            Ranking
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                            onClick={() => handleTabClick('requests')}
                        >
                            Friend Requests
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'add' ? styles.active : ''}`}
                            onClick={() => handleTabClick('add')}
                        >
                            Add Friend
                        </button>
                    </div>
                    <button className={styles.closeButton} onClick={onFriendsClose}>
                        <IoClose />
                    </button>
                </div>
                <div className={styles.content}>
                    {activeTab === 'message' && <Message />}
                    {activeTab === 'ranking' && <Ranking friends={friends} />}
                    {activeTab === 'requests' && <FriendRequests friends={friends} setFriends={setFriends} />}
                    {activeTab === 'add' && <AddFriend />}
                </div>
            </div>
        </div>
    );
};