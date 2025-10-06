import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import './MyQuizzes.css';

function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (code) => {
    const link = `http://localhost:5173/quiz/${code}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <>
      <Navbar />
      <div className="App">
        <div className="container">
          <h1>My Quizzes</h1>

          {loading ? (
            <p style={{ color: 'white' }}>Loading...</p>
          ) : quizzes.length === 0 ? (
            <div className="no-quizzes">
              <p>You haven't created any quizzes yet</p>
              <Link to="/" className="create-quiz-btn">Create Your First Quiz</Link>
            </div>
          ) : (
            <div className="quizzes-grid">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <h3>{quiz.topic}</h3>
                  <p className="quiz-date">
                    Created: {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                  <p className="quiz-code">Code: {quiz.shareableCode}</p>
                  <p className="submission-count">
                    {quiz.submissionCount} {quiz.submissionCount === 1 ? 'submission' : 'submissions'}
                  </p>
                  <div className="quiz-actions">
                    <button 
                      onClick={() => copyLink(quiz.shareableCode)}
                      className="action-btn copy"
                    >
                      Copy Link
                    </button>
                    <Link 
                      to={`/results/${quiz.shareableCode}`}
                      className="action-btn results"
                    >
                      View Results
                    </Link>
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

export default MyQuizzes;