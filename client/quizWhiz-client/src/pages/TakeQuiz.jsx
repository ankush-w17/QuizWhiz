import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import '../App.css';

function TakeQuiz() {
  const { code } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [code]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quiz/${code}`);
      setQuiz(response.data);
    } catch (err) {
      if (err.response?.data?.alreadySubmitted) {
        setError('You have already submitted this quiz');
      } else {
        setError(err.response?.data?.error || 'Quiz not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = async () => {
    const answersArray = [];
    const letters = ['a', 'b', 'c', 'd'];
    
    for (let i = 0; i < quiz.questions.length; i++) {
      if (selectedAnswers[i] === undefined) {
        alert(`Please answer question ${i + 1}`);
        return;
      }
      answersArray.push(letters[selectedAnswers[i]]);
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/quiz/${code}/submit`,
        {
          answers: answersArray
        }
      );
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="App">
          <div className="container">
            <p style={{ color: 'white' }}>Loading quiz...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="App">
          <div className="container">
            <div className="error-message" style={{ marginTop: '2rem' }}>{error}</div>
          </div>
        </div>
      </>
    );
  }

  if (submitted && result) {
    return (
      <>
        <Navbar />
        <div className="App">
          <div className="container">
            <div className="result-container">
              <h2>Quiz Submitted!</h2>
              <div className="score-display">
                <div className="score-circle">
                  <span className="percentage">{result.percentage}%</span>
                  <span className="score-text">{result.score} / {result.total}</span>
                </div>
              </div>
              <p className="result-message">
                {result.percentage >= 80 ? 'Excellent work!' : 
                 result.percentage >= 60 ? 'Good job!' : 
                 'Keep practicing!'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="App">
        <div className="container">
          <h1>Take Quiz: {quiz.topic}</h1>
          
          <div className="quiz-container">
            {quiz.questions.map((q, index) => (
              <div key={index} className="question-card">
                <h3>Question {index + 1}</h3>
                <p className="question-text">{q.question}</p>
                <div className="options">
                  {q.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`option ${selectedAnswers[index] === optIndex ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index, optIndex)}
                    >
                      <input 
                        type="radio" 
                        name={`question-${index}`} 
                        id={`q${index}-opt${optIndex}`}
                        checked={selectedAnswers[index] === optIndex}
                        onChange={() => handleAnswerSelect(index, optIndex)}
                      />
                      <label htmlFor={`q${index}-opt${optIndex}`}>{option}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button className="submit-quiz-btn" onClick={handleSubmit}>
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TakeQuiz;