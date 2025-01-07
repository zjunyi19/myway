import "./register.css"
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Test if email and password are filled
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    // Test if password is complex enough
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError("Email already exists");
          break;
        case 'auth/invalid-email':
          setError("Invalid email format");
          break;
        default:
          setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="register">
      <span className="registerTitle">Register</span>
      <form className="registerForm" onSubmit={handleSubmit}>

        <label>Email</label>
        <input 
          className="registerInput" 
          type="email" 
          placeholder="Enter your email..." 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus={true}
        />

        <label>Password</label>
        <input 
          className="registerInput" 
          type="password" 
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <span className="registerError">{error}</span>}
        
        <button className="registerButton" type="submit">Register</button>
      </form>

      <button className="registerLoginButton" onClick={() => navigate('/login')}>Login</button>
    </div>
  );
}