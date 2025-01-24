import React, { useState, useEffect } from 'react';
import { arrayBufferToBase64 } from '../../../../utils/dateHelpers';
import styles from './ranking.module.css';
import { useAuth } from '../../../../contexts/AuthContext';
import UserInfo from '../../settings/userinfo/UserInfo';

export default function Ranking() {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);

    const fetchFriendsScores = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/friends/get-friends/${user.uid}`);
            const data = await response.json();
            const sortedFriends = data.accepted.sort((a, b) => b.score - a.score);
            setFriends(sortedFriends);
        } catch (error) {
            console.error('Error fetching friends scores:', error);
        }
    };

    useEffect(() => {
        fetchFriendsScores();
    }, [user]);

    const handleUserInfoOpen = (friendId) => {
        setSelectedFriendId(friendId);
        setShowUserInfo(true);
    };

    const handleUserInfoClose = () => {
        setShowUserInfo(false);
    };

    return (
        <div className={styles.rankingContent}>
            <h2>Friend Ranking</h2>
            {friends.length === 0 ? (
                <div className={styles.noFriends}>
                    <p>No friends yet. Add some friends to see their ranking!</p>
                </div>
            ) : (
                <>
                    <table className={styles.rankingTable}>
                        <thead>
                    <tr>
                        <th className={styles.rank}>Rank</th>
                        <th >Avatar</th>
                        <th className={styles.username}>Username</th>
                        <th className={styles.score}>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {friends.map((friend, index) => (
                        <tr key={friend.firebaseUid} onClick={() => handleUserInfoOpen(friend.firebaseUid)}>
                            <td className={styles.rank}>{index + 1}</td>
                            <td>
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
                            </td>
                            <td className={styles.username}>{friend.username}</td>
                            <td className={styles.score}>{friend.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
                    {showUserInfo && <UserInfo userid={selectedFriendId} onSettingsClose={handleUserInfoClose} />}
                </>
            )}
        </div>
    );
}