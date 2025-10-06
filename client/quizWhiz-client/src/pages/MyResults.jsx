import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import "./MyResults.css";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

function MyResults() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/student/submissions"
      );
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="App">
        <div className="container">
          <h1>My Quiz Results</h1>

          {loading ? (
            <LoadingSpinner message="Loading your results..." />
          ) : submissions.length === 0 ? (
            <div className="no-results">
              <p>You haven't taken any quizzes yet</p>
            </div>
          ) : (
            <div className="results-list">
              {submissions.map((sub, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <h3>{sub.quizTopic}</h3>
                    <span
                      className={`score-badge ${
                        sub.percentage >= 80
                          ? "excellent"
                          : sub.percentage >= 60
                          ? "good"
                          : "needs-improvement"
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>
                  <div className="result-details">
                    <p>
                      Score: {sub.score} / {sub.totalQuestions}
                    </p>
                    <p className="date">
                      Submitted: {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyResults;
