import "./topbar.css"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext/AuthProvider";

export default function Topbar({ onAddClick, onSettingsClick }) {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  return (
    <div className="topBar">
      <header className="headerTitle">Habits</header>
      <div className="buttonContainer">
        <button className="addButton" onClick={onAddClick}>
          <i className="bi bi-plus-lg"></i>
        </button>
        <button 
          className="loginButton2" 
          onClick={() => userLoggedIn ? onSettingsClick() : navigate('/login')}
        >
          <i className="fa-solid fa-circle-user"></i>
        </button>
      </div>
    </div>
  );
}
