import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizGenerator from "./QuizGenerator";
import QuizTaking from "./pages/QuizTaking";
import QuizResults from "./pages/QuizResults";
import AuthSuccess from "./pages/AuthSuccess";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              QuizWhiz
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors font-medium">
                  Dashboard
                </Link>
                {user.role === "teacher" && (
                  <Link to="/create-quiz" className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-medium">
                    + Create Quiz
                  </Link>
                )}
                <button 
                  onClick={logout} 
                  className="text-slate-400 hover:text-white font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!user) return <Login />;
  if (role && user.role !== role) return <div className="p-8 text-center text-red-400">Access Denied</div>;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Toaster position="top-center" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }} />
          <NavBar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;