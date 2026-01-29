import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google Auth endpoint
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="auth-container">
      <div className="card auth-box">
        <h2 className="text-gradient" style={{fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center'}}>Welcome Back</h2>
        
        {error && <div className="card" style={{borderColor: '#ef4444', color: '#ef4444', padding: '0.75rem', marginBottom: '1rem', textAlign:'center'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
            <label style={{flex: 1, cursor: 'pointer', textAlign: 'center', padding: '0.5rem', background: role === 'teacher' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: role === 'teacher' ? '#8B5CF6' : 'var(--text-secondary)'}}>
              <input
                type="radio"
                value="teacher"
                checked={role === 'teacher'}
                onChange={(e) => setRole(e.target.value)}
                style={{display: 'none'}}
              />
              Teacher
            </label>
            <label style={{flex: 1, cursor: 'pointer', textAlign: 'center', padding: '0.5rem', background: role === 'student' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: role === 'student' ? '#8B5CF6' : 'var(--text-secondary)'}}>
              <input
                type="radio"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value)}
                style={{display: 'none'}}
              />
              Student
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{display: 'flex', alignItems: 'center', margin: '1.5rem 0'}}>
          <div style={{height: '1px', background: 'var(--border-color)', flex: 1}}></div>
          <span style={{margin: '0 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem'}}>OR</span>
          <div style={{height: '1px', background: 'var(--border-color)', flex: 1}}></div>
        </div>

        <button onClick={handleGoogleLogin} className="google-btn">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px', height: '20px'}} />
          Continue with Google
        </button>

        <p style={{marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
          Don't have an account? <Link to="/register" style={{color: '#8B5CF6', textDecoration: 'none'}}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;