import React, { useState } from 'react';
import styles from './friendsmain.module.css';
import AddFriend from './addfriend/AddFriend';

export default function FriendsMain({ onFriendsClose }) {
  const [activeTab, setActiveTab] = useState('friendList');

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
        return (
          <div className={styles.mainContent}>
            <h2>Your Friends</h2>
            <div className={styles.friend}>
              <img src="avatar1.png" alt="Avatar" className={styles.avatar} />
              <span>Username1</span>
            </div>
            <div className={styles.friend}>
              <img src="avatar2.png" alt="Avatar" className={styles.avatar} />
              <span>Username2</span>
            </div>
          </div>
        );
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
              className={activeTab === 'friendList' ? styles.active : ''}
              onClick={() => setActiveTab('friendList')}
            >
              Friend List
            </li>
            <li 
              className={activeTab === 'ranking' ? styles.active : ''}
              onClick={() => setActiveTab('ranking')}
            >
              Ranking
            </li>
            <li 
              className={activeTab === 'addFriend' ? styles.active : ''}
              onClick={() => setActiveTab('addFriend')}
            >
              Add Friend
            </li>
            <li 
              className={activeTab === 'messages' ? styles.active : ''}
              onClick={() => setActiveTab('messages')}
            >
              Messages
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