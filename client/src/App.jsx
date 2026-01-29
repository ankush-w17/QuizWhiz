import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizGenerator from "./QuizGenerator";
import QuizTaking from "./pages/QuizTaking";
import QuizResults from "./pages/QuizResults";
import AuthSuccess from "./pages/AuthSuccess"; // New page for OAuth redirect
import "./App.css";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <nav className="navbar container">
      <Link to="/" className="logo text-gradient">
        Quantum Quiz
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/" className="nav-item">Dashboard</Link>
            {user.role === "teacher" && (
              <Link to="/create-quiz" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                + Create
              </Link>
            )}
            <button onClick={logout} className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container" style={{padding: '2rem'}}>Loading...</div>;
  if (!user) return <Login />;
  if (role && user.role !== role) return <div className="container">Access Denied</div>;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <NavBar />
          <div className="container" style={{ flex: 1, paddingBottom: '2rem' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              
              <Route path="/" element={
                 <ProtectedRoute>
                   <Dashboard />
                 </ProtectedRoute>
              } />
              
              <Route path="/create-quiz" element={
                <ProtectedRoute role="teacher">
                  <QuizGenerator />
                </ProtectedRoute>
              } />
              
              <Route path="/quiz/:code" element={
                <ProtectedRoute>
                  <QuizTaking />
                </ProtectedRoute>
              } />
              
              <Route path="/quiz/:code/results" element={
                <ProtectedRoute role="teacher">
                  <QuizResults />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;