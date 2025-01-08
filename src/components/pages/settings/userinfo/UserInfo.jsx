import "./userinfo.css";
import { useAuth } from "../../../../contexts/authContext/AuthProvider";
import { useState } from "react";
import { doPasswordChange, doSignOut } from "../../../../firebase/auth";
import { validatePassword } from "../../../../utils/passwordHelpers";

export default function UserInfo({ onSettingsClose }) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleOverlayClick = (e) => {
    if (e.target.className === 'userInfo') {
      onSettingsClose();
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      await doPasswordChange(newPassword);
      setMessage("Password updated successfully!");
      setNewPassword("");
    } catch (error) {
      setError("Failed to update password");
    }
  };

  return (
    <div className="userInfo" onClick={handleOverlayClick}>
      <div className="userInfoWrapper">
        <button className="closeButton" onClick={onSettingsClose}>×</button>
        <h1 className="userInfoTitle">User Profile</h1>
        
        <div className="userInfoItem">
          <label>Email</label>
          <div className="userInfoValue">{user?.email}</div>
        </div>

        <form className="passwordChangeForm" onSubmit={handlePasswordChange}>
          <h2>Change Password</h2>
          <div className="passwordInputGroup">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="passwordInput"
            />
            <button type="submit" className="passwordChangeButton">Update</button>
          </div>
          {error && <span className="error">{error}</span>}
          {message && <span className="success">{message}</span>}
        </form>
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
