import "./login.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login">
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
      </form>
      <button className="loginRegisterButton" onClick={() => navigate('/register')}>
        Register
      </button>
    </div>
  );
}
