import React, { useState } from 'react';
import styles from './addfriend.module.css';
import { useAuth } from '../../../../contexts/AuthContext';
import { arrayBufferToBase64 } from '../../../../utils/dateHelpers';

export default function AddFriend() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
        setError('Please enter a username');
        return;
    }
    
    setIsLoading(true);
    setError('');
    setSearchResult(null);

    try {
      // First search for the user
      const response = await fetch(`http://localhost:5001/api/users/search/${searchTerm}`);
      const foundUser = await response.json();

      if (!foundUser) {
        setError('User not found');
        return;
      }

      // Check if already friends
      const friendCheckResponse = await fetch(`http://localhost:5001/api/friends/check-friendship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUid: user.uid,
          friendUid: foundUser.firebaseUid
        })
      });

      const friendship = await friendCheckResponse.json();
      setSearchResult({
        friendInfo: foundUser,
        friendship: friendship.friendship
      });
    } catch (error) {
      setError('Error searching for user');
    } finally {
      setIsLoading(false);
      setError('');
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/friends/addFriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUidA: user.uid,
          firebaseUidB: searchResult.friendInfo.firebaseUid,
          status: 'pending'
        })
      });

      if (response.ok) {
        setSearchResult(prev => ({
          ...prev,
          friendship: {
            firebaseUidA: user.uid,
            firebaseUidB: searchResult.friendInfo.firebaseUid,
            status: 'pending'
          }
        }));
      } else {
        setError('Failed to add friend');
      }
    } catch (error) {
      setError('Error adding friend');
    } finally {
      setIsLoading(false);
      setError('');
    }
  };

  return (
    <div className={styles.addFriendContent}>
      <h2>Add Friend</h2>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>

      {isLoading && <div className={styles.loading}>Searching...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {searchResult && (
        <div className={styles.resultCard}>
          <div className={styles.userInfo}>
            <div className={styles.avatarContainer}>
              {searchResult.friendInfo.avatar?.data ? (
                <img
                  src={`data:${searchResult.friendInfo.avatar.contentType};base64,${arrayBufferToBase64(searchResult.friendInfo.avatar.data.data)}`}
                  alt="Avatar"
                  className={styles.avatar}
                />
              ) : (
                <i className="fa-solid fa-circle-user" style={{ fontSize: '2rem', color: '#9c9c9c' }}></i>
              )}
            </div>
            <span className={styles.username}>{searchResult.friendInfo.username}</span>
          </div>
          {!searchResult.friendship ? (
            <button 
              onClick={handleAddFriend} 
              className={styles.addButton}
              title="Add Friend"
            >
              <i className="fas fa-plus"></i>
            </button>
          ) : searchResult.friendship.status === 'pending' ? (
            <div className={`${styles.friendIndicator} ${styles.pending}`} title="Pending Approval">
              <i class="fa-solid fa-clock"></i>
            </div>
          ) : (
            <div className={`${styles.friendIndicator} ${styles.approval}`} title="Already Friends">
              <i className="fas fa-check"></i>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
