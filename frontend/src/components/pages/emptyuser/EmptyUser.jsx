import "./emptyuser.css";
import { useNavigate } from "react-router-dom";

export default function EmptyUser() {
  const navigate = useNavigate();

  return (
    <div className="emptyUserContainer">
      <div className="emptyUserBox">
        <h2>Welcome to MyWay!</h2>
        <p>Track your habits, achieve your goals.</p>
        <p>Join us to start building better habits today.</p>
        <div className="emptyUserButtons">
          <button 
            className="emptyUserButton login" 
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <button 
            className="emptyUserButton register" 
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
} 