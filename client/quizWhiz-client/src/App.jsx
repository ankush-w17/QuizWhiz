import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import QuizGenerator from "./QuizGenerator.jsx";
import TeacherResults from "./pages/TeacherResults.jsx";
import Navbar from "./components/Navbar.jsx";
import TakeQuiz from "./pages/TakeQuiz.jsx";
import MyQuizzes from "./pages/MyQuizzes.jsx";
import MyResults from "./pages/MyResults.jsx";
import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: "white", padding: "2rem" }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />

        {/* Protected routes based on role */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "teacher" ? (
              <QuizGenerator />
            ) : (
              <>
                <Navbar />
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <h1 style={{ color: "white" }}>Student Dashboard</h1>
                  <p style={{ color: "#94a3b8" }}>
                    Student quiz-taking feature coming soon...
                  </p>
                </div>
              </>
            )
          }
        />

        <Route
          path="/results/:code"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "teacher" ? (
              <TeacherResults />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/quiz/:code"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "student" ? (
              <TakeQuiz />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/my-quizzes"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "teacher" ? (
              <MyQuizzes />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/my-results"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "student" ? (
              <MyResults />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
