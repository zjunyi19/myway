import "./topbar.css"
import { useNavigate } from "react-router-dom";

export default function Topbar({ onAddClick }) {
  const navigate = useNavigate();

  return (
    <div className="topBar">
      <header className="headerTitle">Habits</header>
      <div className="buttonContainer">
        <button className="addButton" onClick={onAddClick}>
          <i className="bi bi-plus-lg"></i>
        </button>
        <button className="loginButton2" onClick={() => navigate('/login')}>
          <i className="fa-solid fa-circle-user"></i>
        </button>
      </div>
    </div>
  );
}
