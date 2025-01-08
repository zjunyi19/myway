import "./register.css"
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../../firebase";
import { validatePassword } from "../../../utils/passwordHelpers";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if(isRegistering) {
      return;
    }

    // 检查所有字段是否填写
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    // 检查两次密码是否匹配
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 检查密码复杂度
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setIsRegistering(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setIsRegistering(false);
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

        <label>Confirm Password</label>
        <input 
          className="registerInput" 
          type="password" 
          placeholder="Confirm your password..."
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <span className="registerError">{error}</span>}
        <button className="registerButton" type="submit">Register</button>
      </form>

      <button className="registerLoginButton" onClick={() => navigate('/login')}>Login</button>
    </div>
  );
}