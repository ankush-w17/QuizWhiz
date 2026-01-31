import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';

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
        toast.error(`Please answer question ${i + 1}`);
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
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit quiz");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading quiz...</div>;
  if (error) return (
    <div className="max-w-md mx-auto mt-20 text-center space-y-4">
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
      <Link to="/" className="inline-block text-slate-400 hover:text-white transition-colors">
        &larr; Back to Dashboard
      </Link>
    </div>
  );

  if (submitted && result) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="card text-center p-10 space-y-8">
          <h2 className="text-3xl font-bold text-white">Quiz Completed!</h2>
          
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center rounded-full bg-slate-900 border-4 border-primary shadow-[0_0_30px_rgba(139,92,246,0.3)]">
             <div className="flex flex-col">
                <span className="text-4xl font-bold text-white">{result.percentage}%</span>
                <span className="text-slate-400 text-sm">{result.score} / {result.total} Correct</span>
             </div>
          </div>
          
          <div className="space-y-2">
            <p className={`text-xl font-medium ${result.percentage >= 80 ? 'text-green-400' : 'text-slate-300'}`}>
              {result.percentage >= 80 ? "Excellent work! 🌟" : result.percentage >= 60 ? "Good job! 👍" : "Keep practicing! 💪"}
            </p>
            {result.xpEarned && <p className="text-primary font-bold">+{result.xpEarned} XP Earned</p>}
          </div>

          <Link to="/" className="btn-primary block w-full">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">{quiz.topic}</h1>
        <div className="flex gap-4 text-sm text-slate-400">
          <span className="bg-slate-800 px-2 py-0.5 rounded uppercase text-xs font-bold tracking-wider">
            {quiz.difficulty || 'Medium'}
          </span>
          <span>{quiz.questions.length} Questions</span>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, index) => (
          <div key={index} className="card p-6 md:p-8">
            <h3 className="text-lg font-medium text-white mb-6 flex gap-3">
              <span className="text-slate-500 font-bold">0{index + 1}</span>
              {q.question}
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center gap-4 group ${
                    selectedAnswers[index] === optIndex 
                      ? "bg-primary/20 border-primary text-white" 
                      : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/10"
                  }`}
                  onClick={() => handleAnswerSelect(index, optIndex)}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${
                    selectedAnswers[index] === optIndex
                      ? "bg-primary border-primary text-white"
                      : "bg-transparent border-slate-600 text-slate-500 group-hover:border-slate-400 group-hover:text-slate-300"
                  }`}>
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4">
        <button className="btn-primary w-full py-4 text-lg shadow-2xl" onClick={handleSubmit}>
          Submit Assessment
        </button>
      </div>
    </div>
  );
}

export default QuizTaking;
