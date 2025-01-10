import { useState, useEffect } from "react";
import "./userinfo.css";
import { useAuth } from "../../../../contexts/authContext/AuthProvider";
import { doPasswordChange, doSignOut } from "../../../../firebase/auth";
import { validatePassword } from "../../../../utils/passwordHelpers";

export default function UserInfo({ onSettingsClose }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 获取用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 确保 user 和 user.uid 存在
        if (!user?.uid) {
          console.log('No user UID available');
          return;
        }
        const response = await fetch(`http://localhost:5001/api/users/profile/${user.uid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Server response:', errorData);
          throw new Error(`Server responded with ${response.status}: ${errorData}`);
        }
        
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
    if (e.target.className === 'userInfo') {
      onSettingsClose();
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
      setIsUpdatingPassword(false);
      setError("Failed to update password");
    }
  };

  return (
    <div className="userInfo" onClick={handleOverlayClick}>
      <div className="userInfoWrapper">
        <button className="closeButton" onClick={onSettingsClose}>×</button>

        <h1 className="userInfoTitle">User Profile</h1>
        
        <div className="userInfoItem">
          <label>Username</label>
          <div className="userInfoValue">{userData?.username}</div>
        </div>

        <div className="userInfoItem">
          <label>Name</label>
          <div className="userInfoValue">
            {userData ? `${userData.firstName} ${userData.lastName}` : ''}
          </div>
        </div>

        <div className="userInfoItem">
          <label>Email</label>
          <div className="userInfoValue">{user?.email}</div>
        </div>

        <form className="passwordChangeForm" onSubmit={handlePasswordChange}>
          <h2>Change Password</h2>
          <div className="passwordInputContainer">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="passwordInput"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="passwordInput"
            />
          </div>
          <button type="submit" className="passwordChangeButton">Update Password</button>
        </form>

        {error && <span className="error">{error}</span>}
        {message && <span className="success">{message}</span>}

        <button 
          className="userLogoutButton" 
          onClick={() => {
            doSignOut();
            onSettingsClose();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
