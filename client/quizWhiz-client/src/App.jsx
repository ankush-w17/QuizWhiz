import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import QuizGenerator from './QuizGenerator.jsx';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={user ? <QuizGenerator /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;