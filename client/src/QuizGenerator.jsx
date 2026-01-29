import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generateQuiz = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setQuiz(null);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/generate-quiz`, {
        topic: topic,
        numQuestions: numQuestions,
        difficulty: difficulty
      }, {
        withCredentials: true
      });
      
      setQuiz(response.data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const copyShareableLink = () => {
    const link = `${window.location.origin}/quiz/${quiz.shareableCode}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="generator-container">
      <h1 className="page-title text-gradient">Create New Quiz</h1>
      <p className="page-subtitle" style={{marginBottom: '2rem'}}>Use AI to generate a custom quiz in seconds.</p>
      
      {error && <div className="card" style={{borderColor: '#ef4444', color: '#ef4444', marginBottom: '1rem'}}>{error}</div>}
      
      {!quiz ? (
        <div className="card">
          <form onSubmit={generateQuiz}>
            <div className="form-group">
              <label className="form-label">Topic</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Quantum Physics, Ancient Rome, Python Basics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select 
                  className="form-input" 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Questions</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={loading}>
              {loading ? (
                 <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                   <span className="spinner"></span> Generating...
                 </span>
              ) : 'Generate Quiz'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{textAlign: 'center'}}>
          <h2 className="text-gradient" style={{fontSize: '2rem', marginBottom: '1rem'}}>Quiz Ready!</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
            Your quiz on <strong>{quiz.topic}</strong> ({quiz.difficulty}) is ready to share.
          </p>
          
          <div className="form-group">
            <label className="form-label">Shareable Link</label>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <input 
                type="text" 
                className="form-input" 
                value={`${window.location.origin}/quiz/${quiz.shareableCode}`} 
                readOnly 
              />
              <button onClick={copyShareableLink} className="btn-primary">Copy</button>
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center'}}>
            <button onClick={() => setQuiz(null)} className="btn-primary" style={{background: 'transparent', border: '1px solid var(--text-muted)'}}>
              Create Another
            </button>
            <button onClick={() => navigate(`/quiz/${quiz.shareableCode}/results`)} className="btn-primary">
              View Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizGenerator;