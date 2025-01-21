import { useState, useEffect, useRef } from "react";
import styles from "./userinfo.module.css";
import { arrayBufferToBase64 } from "../../../../utils/dateHelpers";
import { useAuth } from '../../../../contexts/AuthContext';
import { auth } from '../../../../firebase/auth';
import { doPasswordChange, doSignOut } from "../../../../firebase/auth";
import { validatePassword } from "../../../../utils/passwordHelpers";

export default function UserInfo({ userid = null, onSettingsClose }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const checkid = userid || user.uid;
        const response = await fetch(`http://localhost:5001/api/users/profile/${checkid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Full error details:', error);
        setError("Failed to load user information");
      }
    };

    fetchUserData();
  }, [user]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onSettingsClose();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setError('');
      const response = await fetch(`http://localhost:5001/api/users/upload-avatar/${user.uid}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      
      // Update the avatar in UI
      if (data.avatar) {
        // Convert the array buffer to base64
        const base64String = btoa(
          new Uint8Array(data.avatar.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        
        setUserData(prevData => ({
          ...prevData,
          avatar: {
            data: data.avatar.data,
            contentType: data.avatar.type
          }
        }));
        setMessage('Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar. Please try again.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (isUpdatingPassword) return;
    
    setError("");
    setMessage("");

    if (!newPassword || !confirmNewPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await doPasswordChange(newPassword);
      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setError("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className={styles.userInfo} onClick={handleOverlayClick}>
      <div className={styles.userInfoWrapper}>
        <button className={styles.closeButton} onClick={onSettingsClose}>×</button>

        <h1 className={styles.userInfoTitle}>User Profile</h1>
        
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer} onClick={handleAvatarClick}>
            {userData?.avatar?.data ? (
              <img 
                src={`data:${userData.avatar.contentType};base64,${arrayBufferToBase64(userData.avatar.data.data)}`}
                alt="Avatar" 
                className={styles.avatar} 
              />
            ) : (
              <i className="fa-solid fa-circle-user" style={{ fontSize: '5rem', color: '#9c9c9c' }}></i>
            )}
            {userid === null && (
              <>
                <div className={styles.uploadOverlay}>
                  <i className="fas fa-camera" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className={styles.fileInput}
                />
              </>
            )}
          </div>
        </div>

        <div className={styles.userInfoItem}>
          <label>Username</label>
          <div className={styles.userInfoValue}>{userData?.username}</div>
        </div>

        <div className={styles.userInfoItem}>
          <label>Name</label>
          <div className={styles.userInfoValue}>
            {userData ? `${userData.firstName} ${userData.lastName}` : ''}
          </div>
        </div>

        <div className={styles.userInfoItem}>
          <label>Email</label>
          <div className={styles.userInfoValue}>{user?.email}</div>
        </div>

        <div className={styles.userInfoItem}>
          <label>Score</label>
          <div className={styles.userInfoValue}>{userData?.score}</div>
        </div>

        {userid === null && (
          <>
            <form className={styles.passwordChangeForm} onSubmit={handlePasswordChange}>
              <h2>Change Password</h2>
              <div className={styles.passwordInputContainer}>
                <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.passwordInput}
            />
            {newPassword && (
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={styles.passwordInput}
              />
            )}
            </div>
            <button 
              type="submit" 
              className={styles.passwordChangeButton}
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <button 
            className={styles.userLogoutButton} 
            onClick={() => {
              doSignOut();
              onSettingsClose();
            }}
          >
            Logout
            </button>
          </>
        )}
        {error && <span className={styles.error}>{error}</span>}
        {message && <span className={styles.success}>{message}</span>}

      </div>
    </div>
  );
}