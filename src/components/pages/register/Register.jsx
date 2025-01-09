import "./register.css"
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../../firebase";
import { validatePassword } from "../../../utils/passwordHelpers";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // All fields are required
    if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required");
      return;
    }

    // Username Validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters and can only contain letters, numbers and underscore");
      return;
    }

    // Password Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setIsRegistering(true);

      // 1. Check if username is available
      const checkResponse = await fetch('http://localhost:5001/api/users/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const checkResult = await checkResponse.json();
      if (!checkResponse.ok) {
        throw new Error(checkResult.message || 'Username is not available');
      }

      // 2. If username is available, create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      try {
        // 3. Save user data to MongoDB
        const response = await fetch('http://localhost:5001/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseUid: userCredential.user.uid,
            username,
            firstName,
            lastName,
          }),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          // 4. 如果 MongoDB 保存失败，删除 Firebase 用户
          await userCredential.user.delete();
          throw new Error(responseData.message || 'Failed to save user data');
        }

        navigate("/login");
      } catch (mongoError) {
        // 如果 MongoDB 操作失败，删除 Firebase 用户
        await userCredential.user.delete();
        throw mongoError;
      }

    } catch (error) {
      setIsRegistering(false);
      console.error('Registration error:', error);
      
      if (error.code) {
        // Firebase 错误
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError("Email already exists");
            break;
          case 'auth/invalid-email':
            setError("Invalid email format");
            break;
          default:
            setError(`Registration failed: ${error.message}`);
        }
      } else {
        // MongoDB 或其他错误
        setError(error.message || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="register">
      <span className="registerTitle">Register</span>
      <form className="registerForm" onSubmit={handleSubmit}>
  
        <label>Username</label> {/* Username */}
        <input
          type="text"
          className="registerInput"
          placeholder="Enter your username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus={true}
          minLength={3}
          maxLength={30}
        />
        
        <label>Email</label> {/* Email */}
        <input
          type="email"
          className="registerInput"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>First Name</label> {/* First Name */}
        <input
          type="text"
          className="registerInput"
          placeholder="Enter your first name..."
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label>Last Name</label> {/* Last Name */}
        <input
          type="text"
          className="registerInput"
          placeholder="Enter your last name..."
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label>Password</label> {/* Password */}
        <input
          type="password"
          className="registerInput"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />


        {password && (
          <>
            <label>Confirm Password</label> {/* Confirm Password Only Show When Password is Filled */}
            <input
              type="password"
              className="registerInput"
              placeholder="Confirm your password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </>
        )}

        <button 
          className="registerButton" 
          type="submit"
          disabled={isRegistering}
        >  
          {isRegistering ? "Registering..." : "Register"}
        </button>                                         {/* Register Button */}

        {error && <span className="error">{error}</span>} {/* Error Message */}
      </form>


      <button className="registerLoginButton" onClick={() => navigate("/login")}>
        Login
      </button> {/* Login Button On Top Right */}
    </div>
  );
}