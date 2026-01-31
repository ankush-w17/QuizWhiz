import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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

  if (loading) return <div className="text-center py-20 text-slate-500">Loading results...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const averageScore = results.submissions.length > 0
    ? Math.round(results.submissions.reduce((sum, s) => sum + s.percentage, 0) / results.submissions.length)
    : 0;

  return (
    <div className="space-y-8">
      <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
        &larr; Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Results: {results.topic}</h1>
          <p className="text-slate-400">Difficulty: {results.difficulty || 'Medium'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center p-6">
           <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Submissions</h3>
           <p className="text-4xl font-bold text-primary">{results.submissions.length}</p>
        </div>
        <div className="card text-center p-6">
           <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Avg. Score</h3>
           <p className="text-4xl font-bold text-secondary">{averageScore}%</p>
        </div>
        <div className="card text-center p-6">
           <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Questions</h3>
           <p className="text-4xl font-bold text-white">{results.totalQuestions}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-white/5">
           <h3 className="text-lg font-bold text-white">Student Submissions</h3>
        </div>
        
        {results.submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-sm">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.submissions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors text-sm">
                    <td className="p-4 text-white font-medium">{sub.studentName}</td>
                    <td className="p-4 text-slate-300">{sub.score} / {results.totalQuestions}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sub.percentage >= 80 ? 'bg-green-500/20 text-green-400' : 
                        sub.percentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
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
