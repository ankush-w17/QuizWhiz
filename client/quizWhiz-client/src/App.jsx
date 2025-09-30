import { useState } from 'react';
import axios from 'axios';

function App() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/generate-quiz');
      setQuiz(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Quiz Generator</h1>
      <button onClick={generateQuiz} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Quiz'}
      </button>
      
      {quiz && (
        <div>
          <h2>Generated Quiz:</h2>
          <pre>{JSON.stringify(quiz, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;