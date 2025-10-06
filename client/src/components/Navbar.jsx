import { Link } from 'react-router-dom';
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
          <Link to="/">
            <img src="/QuizWhiz_logo.png" alt="QuizWhiz" className="logo" />
          </Link>
        </div>
        
        <div className="navbar-right">
          {user.role === 'teacher' && (
            <Link to="/my-quizzes" className="nav-link">My Quizzes</Link>
          )}
          {user.role === 'student' && (
            <Link to="/my-results" className="nav-link">My Results</Link>
          )}
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