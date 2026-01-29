import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function QuizTaking() {
  const { code } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [code]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/quiz/${code}`,
        { withCredentials: true }
      );
      setQuiz(response.data);
    } catch (err) {
      if (err.response?.data?.alreadySubmitted) {
        setError("You have already submitted this quiz");
      } else {
        setError(err.response?.data?.error || "Quiz not found");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const handleSubmit = async () => {
    const answersArray = [];
    const letters = ["a", "b", "c", "d"];

    for (let i = 0; i < quiz.questions.length; i++) {
      if (selectedAnswers[i] === undefined) {
        alert(`Please answer question ${i + 1}`);
        return;
      }
      answersArray.push(letters[selectedAnswers[i]]);
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/quiz/${code}/submit`,
        { answers: answersArray },
        { withCredentials: true }
      );
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit quiz");
    }
  };

  if (loading) return <div className="container">Loading quiz...</div>;
  if (error) return (
    <div className="container" style={{marginTop: '2rem'}}>
      <div className="card" style={{borderColor: '#ef4444', color: '#ef4444', textAlign: 'center'}}>
        <h2>{error}</h2>
        <Link to="/" className="btn-primary" style={{display: 'inline-block', marginTop: '1rem', textDecoration: 'none'}}>Back to Dashboard</Link>
      </div>
    </div>
  );

  if (submitted && result) {
    return (
      <div className="container" style={{maxWidth: '600px', marginTop: '3rem'}}>
        <div className="card" style={{textAlign: 'center', padding: '3rem 2rem'}}>
          <h2 className="text-gradient" style={{fontSize: '2rem', marginBottom: '2rem'}}>Quiz Completed!</h2>
          
          <div style={{position: 'relative', width: '150px', height: '150px', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'conic-gradient(var(--secondary-gradient), var(--bg-card))', boxShadow: 'var(--glow-primary)'}}>
             <div style={{position: 'absolute', width: '140px', height: '140px', background: 'var(--bg-dark)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{result.percentage}%</span>
                <span style={{color: 'var(--text-secondary)'}}>{result.score} / {result.total}</span>
             </div>
          </div>
          
          <div style={{marginBottom: '2rem'}}>
            <p style={{fontSize: '1.2rem', color: result.percentage >= 80 ? '#4ade80' : 'var(--text-primary)'}}>
              {result.percentage >= 80 ? "Excellent work! 🌟" : result.percentage >= 60 ? "Good job! 👍" : "Keep practicing! 💪"}
            </p>
            {result.xpEarned && <p style={{color: '#8B5CF6', fontWeight: 'bold', marginTop: '0.5rem'}}>+{result.xpEarned} XP Earned</p>}
          </div>

          <Link to="/" className="btn-primary" style={{textDecoration: 'none'}}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1 className="page-title text-gradient">{quiz.topic}</h1>
        <p className="page-subtitle">Difficulty: {quiz.difficulty || 'Medium'}</p>
      </div>

      <div className="question-card">
        {quiz.questions.map((q, index) => (
          <div key={index} className="card" style={{marginBottom: '2rem'}}>
            <h3 style={{marginBottom: '1rem'}}>Question {index + 1}</h3>
            <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>{q.question}</p>
            
            <div className="options">
              {q.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  className={`option-btn ${selectedAnswers[index] === optIndex ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(index, optIndex)}
                >
                  <span style={{
                    display: 'inline-block', width: '24px', height: '24px', 
                    border: '1px solid var(--border-color)', borderRadius: '50%', 
                    marginRight: '10px', textAlign: 'center', lineHeight: '22px', fontSize: '0.8rem',
                    background: selectedAnswers[index] === optIndex ? '#06B6D4' : 'transparent',
                    borderColor: selectedAnswers[index] === optIndex ? '#06B6D4' : 'var(--border-color)'
                  }}>
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="btn-primary" onClick={handleSubmit} style={{width: '100%', marginBottom: '3rem'}}>
          Submit Assessment
        </button>
      </div>
    </div>
  );
}

export default QuizTaking;
