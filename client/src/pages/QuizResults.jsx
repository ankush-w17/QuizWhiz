import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function QuizResults() {
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
        `${API_URL}/api/quiz/${code}/results`,
        { withCredentials: true }
      );
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading results...</div>;
  if (error) return <div className="container" style={{color: '#ef4444'}}>{error}</div>;

  const averageScore = results.submissions.length > 0
    ? Math.round(results.submissions.reduce((sum, s) => sum + s.percentage, 0) / results.submissions.length)
    : 0;

  return (
    <div className="container">
      <Link to="/" style={{color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block'}}>&larr; Back to Dashboard</Link>
      
      <div className="dashboard-header">
        <h1 className="page-title text-gradient">Results: {results.topic}</h1>
        <p className="page-subtitle">Difficulty: {results.difficulty || 'Medium'}</p>
      </div>

      <div className="quiz-grid" style={{marginBottom: '2rem'}}>
        <div className="card" style={{textAlign: 'center'}}>
           <h3 style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Submissions</h3>
           <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#8B5CF6'}}>{results.submissions.length}</p>
        </div>
        <div className="card" style={{textAlign: 'center'}}>
           <h3 style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Avg. Score</h3>
           <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#06B6D4'}}>{averageScore}%</p>
        </div>
        <div className="card" style={{textAlign: 'center'}}>
           <h3 style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Total Questions</h3>
           <p style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{results.totalQuestions}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom: '1.5rem'}}>Student Submissions</h3>
        
        {results.submissions.length === 0 ? (
          <p style={{color: 'var(--text-secondary)', textAlign: 'center'}}>No submissions yet.</p>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)'}}>
                  <th style={{padding: '1rem'}}>Name</th>
                  <th style={{padding: '1rem'}}>Score</th>
                  <th style={{padding: '1rem'}}>Status</th>
                  <th style={{padding: '1rem'}}>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.submissions.map((sub, idx) => (
                  <tr key={idx} style={{borderBottom: '1px solid rgba(148, 163, 184, 0.05)'}}>
                    <td style={{padding: '1rem'}}>{sub.studentName}</td>
                    <td style={{padding: '1rem'}}>{sub.score} / {results.totalQuestions}</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.8rem',
                        background: sub.percentage >= 80 ? 'rgba(74, 222, 128, 0.2)' : sub.percentage >= 60 ? 'rgba(250, 204, 21, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: sub.percentage >= 80 ? '#4ade80' : sub.percentage >= 60 ? '#facc15' : '#ef4444'
                      }}>
                        {sub.percentage}%
                      </span>
                    </td>
                    <td style={{padding: '1rem', color: 'var(--text-muted)'}}>
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizResults;
