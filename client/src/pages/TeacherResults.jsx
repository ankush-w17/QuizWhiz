import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import "./TeacherResults.css";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function TeacherResults() {
  const { code } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, [code]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/quiz/${code}/results`
      );
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="results-page">
          <div className="container">
            <LoadingSpinner message="Loading results..." />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="results-page">
          <div className="container">
            <div className="error-box">{error}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="results-page">
        <div className="container">
          <h1>Quiz Results: {results.topic}</h1>

          <div className="stats-card">
            <div className="stat">
              <span className="stat-label">Total Submissions</span>
              <span className="stat-value">{results.submissions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Questions</span>
              <span className="stat-value">{results.totalQuestions}</span>
            </div>
            {results.submissions.length > 0 && (
              <div className="stat">
                <span className="stat-label">Average Score</span>
                <span className="stat-value">
                  {Math.round(
                    results.submissions.reduce(
                      (sum, s) => sum + s.percentage,
                      0
                    ) / results.submissions.length
                  )}
                  %
                </span>
              </div>
            )}
          </div>

          {results.submissions.length === 0 ? (
            <div className="no-submissions">
              <p>No submissions yet</p>
            </div>
          ) : (
            <div className="submissions-table">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.submissions.map((submission, index) => (
                    <tr key={index}>
                      <td>{submission.studentName}</td>
                      <td>
                        {submission.score} / {results.totalQuestions}
                      </td>
                      <td>
                        <span
                          className={`percentage-badge ${
                            submission.percentage >= 80
                              ? "excellent"
                              : submission.percentage >= 60
                              ? "good"
                              : "needs-improvement"
                          }`}
                        >
                          {submission.percentage}%
                        </span>
                      </td>
                      <td>
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TeacherResults;
