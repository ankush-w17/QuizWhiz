import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Create New Quiz
        </h1>
        <p className="text-slate-400">Power your assessments with AI</p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-center">
          {error}
        </div>
      )}
      
      {!quiz ? (
        <div className="card">
          <form onSubmit={generateQuiz} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quiz Topic</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Quantum Physics, Ancient Rome, Python Basics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                <select 
                  className="input-field cursor-pointer" 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Questions</label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-lg" disabled={loading}>
              {loading ? (
                 <span className="flex items-center justify-center gap-2">
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   Generating...
                 </span>
              ) : 'Generate Quiz'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card text-center space-y-8 py-10">
          <div className="space-y-2">
             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
               ✓
             </div>
             <h2 className="text-2xl font-bold text-white">Quiz Generated Successfully!</h2>
             <p className="text-slate-400">
               Your quiz on <span className="text-primary font-medium">{quiz.topic}</span> is ready.
             </p>
          </div>
          
          <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5 space-y-4 max-w-sm mx-auto">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Shareable Code</p>
            <div className="text-4xl font-mono font-bold tracking-wider text-white select-all">
              {quiz.shareableCode}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={copyShareableLink} className="btn-primary">
              Copy Link
            </button>
            <button onClick={() => navigate(`/quiz/${quiz.shareableCode}/results`)} className="px-6 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition-colors text-white font-medium">
              View Results
            </button>
          </div>
          
          <button onClick={() => setQuiz(null)} className="text-slate-500 hover:text-slate-300 text-sm mt-4 block mx-auto transition-colors">
            Generate Another
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizGenerator;