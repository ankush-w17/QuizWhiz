import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <img src="/QuizWhiz_logo.png" alt="QuizWhiz" className="logo" />
        </div>
        
        <div className="navbar-right">
          <span className="user-info">
            {user.name} ({user.role})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;