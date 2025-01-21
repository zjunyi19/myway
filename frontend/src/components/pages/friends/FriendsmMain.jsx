import React, { useState } from 'react';
import styles from './friendsmain.module.css';
import AddFriend from './addfriend/AddFriend';
import FriendList from './friendlist/FriendList';

export default function FriendsMain({ onFriendsClose }) {
    const [activeTab, setActiveTab] = useState('messages');

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onFriendsClose();
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'addFriend':
                return <AddFriend />;
            case 'friendList':
                return <FriendList />;
            case 'ranking':
                return (
                    <div className={styles.mainContent}>
                        <h2>Friend Ranking</h2>
                        {/* Add ranking content */}
                    </div>
                );
            case 'messages':
                return (
                    <div className={styles.mainContent}>
                        <h2>Messages</h2>
                        {/* Add messages content */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container} onClick={handleOverlayClick}>
            <div className={styles.content} onClick={e => e.stopPropagation()}>
                <div className={styles.menu}>
                    <ul>
                        <li 
                            className={activeTab === 'messages' ? styles.active : ''}
                            onClick={() => setActiveTab('messages')}
                        >
                            Messages
                        </li>
                        <li 
                            className={activeTab === 'ranking' ? styles.active : ''}
                            onClick={() => setActiveTab('ranking')}
                        >
                            Ranking
                        </li>
                        <li 
                            className={activeTab === 'friendList' ? styles.active : ''}
                            onClick={() => setActiveTab('friendList')}
                        >
                            Friend Requests
                        </li>
                        <li 
                            className={activeTab === 'addFriend' ? styles.active : ''}
                            onClick={() => setActiveTab('addFriend')}
                        >
                            Add Friend
                        </li>
                       
                    </ul>
                </div>
                <div className={styles.contentArea}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}