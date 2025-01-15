import styles from "./login.module.css";
import { useNavigate} from "react-router-dom";
import { doSignInWithEmailAndPassword, doPasswordReset } from "../../../firebase/auth";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
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
    <div className={styles.login}>
      <span className={styles.loginTitle}>Login</span>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          className={styles.loginInput} 
          type="email" 
          placeholder="Enter your email..." 
          autoFocus={true}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password</label>
        <input 
          className={styles.loginInput} 
          type="password" 
          placeholder="Enter your password..."
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <span className={styles.loginError}>{error}</span>}
        <button className={styles.loginButton} type="submit">Login</button>

        <div className={styles.forgotPassword}>
          <button 
            type="button" 
            className={styles.resetButton}
            onClick={handlePasswordReset}
          >
            Forgot Password?
          </button>
        </div>
      </form>
      {resetMessage && <span className={styles.resetMessage}>{resetMessage}</span>}
      <button className={styles.loginRegisterButton} onClick={() => navigate('/register')}>
        Register
      </button>
    </div>
  );
}