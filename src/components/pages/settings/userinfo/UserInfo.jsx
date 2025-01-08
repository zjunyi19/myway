import "./userinfo.css";
import { useAuth } from "../../../../contexts/authContext/AuthProvider";
import { useState } from "react";
import { doPasswordChange, doSignOut } from "../../../../firebase/auth";
import { validatePassword } from "../../../../utils/passwordHelpers";

export default function UserInfo({ onSettingsClose }) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
