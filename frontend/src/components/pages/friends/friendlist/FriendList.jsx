import React, { useState, useEffect } from 'react';
import styles from './friendlist.module.css';
import { useAuth } from '../../../../contexts/AuthContext';
import { arrayBufferToBase64 } from '../../../../utils/dateHelpers';
import UserInfo from '../../settings/userinfo/UserInfo';

export default function FriendList() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [friendList, setFriendList] = useState({ pending: [], accepted: [] });
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const [showPending, setShowPending] = useState(true);
    const [showAccepted, setShowAccepted] = useState(true);

    const handleUserInfoClose = () => { setShowUserInfo(false); };
    const handleUserInfoOpen = (friendId) => { setShowUserInfo(true); setSelectedFriendId(friendId); };
    
    const fetchFriendList = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/friends/get-friends/${user.uid}`);
            const data = await response.json();
            setFriendList(data);
        } catch (error) {
            console.error('Error fetching friend list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendList();
    }, [user]);

    const handleAcceptFriend = async (friendUid) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/friends/update-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userUid: user.uid,
                    friendUid,
                    status: 'accepted'
                })
            });

            if (response.ok) {
                setFriendList(prev => {
                    // Find the friend object from pending list
                    const acceptedFriend = prev.pending.find(friend => friend.firebaseUid === friendUid);
                    
                    return {
                        pending: prev.pending.filter(friend => friend.firebaseUid !== friendUid),
                        accepted: [...prev.accepted, acceptedFriend]
                    };
                });
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectFriend = async (friendUid) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/friends/remove-friend', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userUid: user.uid,
                    friendUid
                })
            });

            if (response.ok) {
                setFriendList(prev => ({
                    ...prev,
                    pending: prev.pending.filter(friend => friend.firebaseUid !== friendUid)
                }));
            }
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={styles.mainContent}>
                <h2>Your Friends</h2>
                {isLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : friendList.pending.length === 0 && friendList.accepted.length === 0 ? (
                    <div className={styles.noFriends}>You don't have any friends yet</div>
                ) : (
                    <>
                        <div className={styles.friendSection}>
                            <div className={styles.sectionHeader} onClick={() => setShowPending(!showPending)}>
                                <h3>Pending Friend Requests ({friendList.pending.length})</h3>
                                <i className={`fas fa-chevron-${showPending ? 'up' : 'down'}`}></i>
                            </div>
                            {showPending && (
                                <div className={styles.friendList}>
                                    {friendList.pending.map(friend => (
                                        <div key={friend.firebaseUid} className={styles.friendCard} onClick={() => handleUserInfoOpen(friend.firebaseUid)}>
                                            <div className={styles.friendInfo}>
                                                <div className={styles.avatarContainer}>
                                                    {friend.avatar?.data ? (
                                                        <img
                                                            src={`data:${friend.avatar.contentType};base64,${arrayBufferToBase64(friend.avatar.data.data)}`}
                                                            alt="Avatar"
                                                            className={styles.avatar}
                                                        />
                                                    ) : (
                                                        <i className="fa-solid fa-circle-user" style={{ fontSize: '2rem', color: '#9c9c9c' }}></i>
                                                    )}
                                                </div>
                                                <span className={styles.username}>{friend.username}</span>
                                            </div>
                                            <div className={styles.actionButtons}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAcceptFriend(friend.firebaseUid);
                                                    }}
                                                    className={styles.acceptButton}
                                                >
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRejectFriend(friend.firebaseUid);
                                                    }}
                                                    className={styles.rejectButton}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.friendSection}>
                            <div 
                                className={styles.sectionHeader} 
                                onClick={() => setShowAccepted(!showAccepted)}
                            >
                                <h3>Friends ({friendList.accepted.length})</h3>
                                <i className={`fas fa-chevron-${showAccepted ? 'up' : 'down'}`}></i>
                            </div>
                            {showAccepted && (
                                <div className={styles.friendList}>
                                    {friendList.accepted.map(friend => (
                                        <div 
                                            key={friend.firebaseUid} 
                                            className={styles.friendCard}
                                            onClick={() => handleUserInfoOpen(friend.firebaseUid)}
                                        >
                                            <div className={styles.friendInfo}>
                                                <div className={styles.avatarContainer}>
                                                    {friend.avatar?.data ? (
                                                        <img
                                                            src={`data:${friend.avatar.contentType};base64,${arrayBufferToBase64(friend.avatar.data.data)}`}
                                                            alt="Avatar"
                                                            className={styles.avatar}
                                                        />
                                                    ) : (
                                                        <i className="fa-solid fa-circle-user" style={{ fontSize: '2rem', color: '#9c9c9c' }}></i>
                                                    )}
                                                </div>
                                                <span className={styles.username}>{friend.username}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {showUserInfo && <UserInfo userid={selectedFriendId} onSettingsClose={handleUserInfoClose} />}
        </>
    );
}
