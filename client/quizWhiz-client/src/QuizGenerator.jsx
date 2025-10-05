import { useState } from 'react';
import axios from 'axios';
import './App.css';

function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [shareableCode, setShareableCode] = useState('');

  const generateQuiz = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    if (numQuestions < 1 || numQuestions > 20) {
      alert('Please enter between 1 and 20 questions');
      return;
    }

    setLoading(true);
    setSubmitted(false);
    setResult(null);
    setSelectedAnswers({});

    try {
      const response = await axios.post('http://localhost:5000/api/generate-quiz', {
        topic: topic,
        numQuestions: numQuestions
      });
      setQuiz(response.data);
      setShareableCode(response.data.shareableCode);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate quiz');
    }
    setLoading(false);
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
        `http://localhost:5000/api/quiz/${shareableCode}/submit`,
        {
          studentName: 'Teacher Preview',
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

  const copyShareableLink = () => {
    const link = `http://localhost:3000/quiz/${shareableCode}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="App">
      <div className="container">
        <h1>QuizWhiz</h1>
        
        <form onSubmit={generateQuiz} className="input-section">
          <input
            type="text"
            placeholder="Enter quiz topic (e.g., JavaScript basics, World History)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          
          <div className="number-input-group">
            <label htmlFor="numQuestions">Number of Questions:</label>
            <input
              type="number"
              id="numQuestions"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </form>

        {quiz && !submitted && (
          <div className="quiz-container">
            <div className="quiz-header">
              <h2>Generated Quiz: {quiz.topic}</h2>
              <div className="shareable-section">
                <p>Share this link with students:</p>
                <div className="link-copy">
                  <input 
                    type="text" 
                    value={`http://localhost:3000/quiz/${shareableCode}`}
                    readOnly
                  />
                  <button onClick={copyShareableLink} className="copy-btn" type="button">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

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
              Submit
            </button>
          </div>
        )}

        {submitted && result && (
          <div className="result-container">
            <h2>Quiz Results</h2>
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
            <button onClick={() => {
              setSubmitted(false);
              setResult(null);
              setQuiz(null);
              setSelectedAnswers({});
              setTopic('');
            }} className="new-quiz-btn">
              Create New Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizGenerator;