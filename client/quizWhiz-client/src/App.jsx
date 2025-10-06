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
                <div className="App">
                  <div className="container" style={{ textAlign: "center" }}>
                    <h1 style={{ color: "white", marginBottom: "1.5rem" }}>
                      Welcome, {user.name}!
                    </h1>
                    <div
                      style={{
                        background: "#334155",
                        padding: "2rem",
                        borderRadius: "12px",
                      }}
                    >
                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: "1.1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        To take a quiz, ask your teacher for the quiz link or
                        code.
                      </p>
                      <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                        Click "My Results" in the navigation to view your quiz
                        history.
                      </p>
                    </div>
                  </div>
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
