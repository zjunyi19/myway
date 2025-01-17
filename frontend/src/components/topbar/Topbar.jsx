import styles from "./topbar.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

export default function Topbar({ onAddClick, onSettingsClick, onFriendsClick }) {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  return (
    <div className={styles.topBar}>
      <header className={styles.headerTitle}>Habits</header>
      <div className={styles.buttonContainer}>
        <button className={styles.addButton} onClick={onAddClick}>
          <i className="bi bi-plus-lg"></i>
        </button>
        <button 
          className={styles.loginButton2} 
          onClick={() => userLoggedIn ? onSettingsClick() : navigate('/login')}
        >
          <i className="fa-solid fa-circle-user"></i>
        </button>
        <button className={styles.friendsButton} onClick={onFriendsClick}>
          <i className="fa-solid fa-user-friends"></i>
        </button>
      </div>
    </div>
  );
}