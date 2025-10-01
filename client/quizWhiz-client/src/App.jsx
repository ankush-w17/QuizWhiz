import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    if (numQuestions < 1 || numQuestions > 20) {
      alert('Please enter between 1 and 20 questions');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/generate-quiz', {
        topic: topic,
        numQuestions: numQuestions
      });
      setQuiz(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate quiz');
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>QuizWhiz</h1>
        
        <div className="input-section">
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

          <button onClick={generateQuiz} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>

        {quiz && quiz.questions && (
          <div className="quiz-container">
            <h2>Generated Quiz: {topic}</h2>
            {quiz.questions.map((q, index) => (
              <div key={index} className="question-card">
                <h3>Question {index + 1}</h3>
                <p className="question-text">{q.question}</p>
                <div className="options">
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} className="option">
                      <input 
                        type="radio" 
                        name={`question-${index}`} 
                        id={`q${index}-opt${optIndex}`}
                      />
                      <label htmlFor={`q${index}-opt${optIndex}`}>{option}</label>
                    </div>
                  ))}
                </div>
                <p className="correct-answer">
                  <strong>Correct Answer:</strong> {q.correctAnswer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;