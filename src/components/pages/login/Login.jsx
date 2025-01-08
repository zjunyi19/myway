import "./login.css";
import { useNavigate, Navigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { useAuth } from "../../../contexts/authContext/AuthProvider";
import { doSignInWithEmailAndPassword, doPasswordReset } from "../../../firebase/auth";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const {userLoggedIn} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
        navigate("/");
      } catch (error) {
        setError("Invalid email or password");
        setIsSigningIn(false);
      }
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      await doPasswordReset(email);
      setResetMessage("Password reset email sent!");
    } catch (error) {
      setError("Failed to reset password");
    }
  };

  return (
    <div className="login">
      {userLoggedIn && <Navigate to="/" />}
      <span className="loginTitle">Login</span>
      <form className="loginForm" onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          className="loginInput" 
          type="email" 
          placeholder="Enter your email..." 
          autoFocus={true}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password</label>
        <input 
          className="loginInput" 
          type="password" 
          placeholder="Enter your password..."
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <span className="loginError">{error}</span>}
        <button className="loginButton" type="submit">Login</button>

        <div className="forgotPassword">
          <button 
            type="button" 
            className="resetButton"
            onClick={handlePasswordReset}
          >
            Forgot Password?
          </button>
        </div>
      </form>
      {resetMessage && <span className="resetMessage">{resetMessage}</span>}
      <button className="loginRegisterButton" onClick={() => navigate('/register')}>
        Register
      </button>
    </div>
  );
}
