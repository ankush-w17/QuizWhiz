import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import QuizGenerator from './QuizGenerator.jsx';
import TeacherResults from './pages/TeacherResults.jsx';
import MyQuizzes from './pages/MyQuizzes.jsx';
import MyResults from './pages/MyResults.jsx';
import TakeQuiz from './pages/TakeQuiz.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

function StudentDashboard() {
  const { user } = useAuth();
  const [quizCode, setQuizCode] = useState('');
  const navigate = useNavigate();

  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (quizCode.trim()) {
      navigate(`/quiz/${quizCode.trim()}`);
    } else {
      alert('Please enter a quiz code');
    }
  };

  return (
    <>
      <Navbar />
      <div className="App">
        <div className="container">
          <h1>Welcome, {user.name}!</h1>
          
          <form onSubmit={handleStartQuiz} className="input-section" style={{ marginTop: '2rem' }}>
            <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.3rem' }}>Enter Quiz Code</h2>
            <input
              type="text"
              placeholder="Enter the quiz code from your teacher"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <button type="submit">
              Start Quiz
            </button>
          </form>

          <div style={{ background: '#334155', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem' }}>
            <p style={{ color: '#cbd5e1', textAlign: 'center', margin: 0 }}>
              Click "My Results" in the navigation to view your quiz history
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

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
        
        <Route 
          path="/" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'teacher' ? <QuizGenerator /> :
            <StudentDashboard />
          } 
        />
        
        <Route 
          path="/my-quizzes" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'teacher' ? <MyQuizzes /> : 
            <Navigate to="/" />
          } 
        />

        <Route 
          path="/my-results" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'student' ? <MyResults /> : 
            <Navigate to="/" />
          } 
        />
        
        <Route 
          path="/results/:code" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'teacher' ? <TeacherResults /> : 
            <Navigate to="/" />
          } 
        />

        <Route 
          path="/quiz/:code" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'student' ? <TakeQuiz /> : 
            <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;