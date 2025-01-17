import React from 'react';
import styles from './friendsmain.module.css';

export default function FriendsMain({ onFriendsClose }) {
  return (
    <div className={styles.container} onClick={onFriendsClose}>
      <div className={styles.content}>
        <div className={styles.menu}>
          <ul>
            <li>Friend List</li>
            <li>Ranking</li>
            <li>Add Friend</li>
            <li>Messages</li>
          </ul>
        </div>
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
          {/* Add more friends as needed */}
        </div>
      </div>
    </div>
  );
}