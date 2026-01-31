import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EXPLORE_TOPICS = [
  { title: "Artificial Intelligence", desc: "Discover the world of AI, machine learning and neural networks", difficulty: "Hard" },
  { title: "Quantum Physics", desc: "Explore the mysteries of quantum mechanics and particle physics", difficulty: "Hard" },
  { title: "Space Exploration", desc: "Journey through the cosmos and test your knowledge of space", difficulty: "Medium" },
  { title: "Cybersecurity", desc: "Test your knowledge about digital security and hacking prevention", difficulty: "Hard" },
  { title: "Future Tech", desc: "Test your knowledge on emerging technologies and innovations", difficulty: "Medium" },
  { title: "Robotics", desc: "Learn about the fascinating world of robots and automation", difficulty: "Medium" },
  { title: "World History", desc: "Test your knowledge of ancient civilizations and modern events", difficulty: "Medium" },
  { title: "Geography", desc: "Explore the world's continents, countries, and cultures", difficulty: "Easy" },
  { title: "Literature", desc: "Dive into classic novels, poems, and famous authors", difficulty: "Hard" },
];

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const endpoint = user.role === 'teacher' ? '/api/teacher/quizzes' : '/api/student/submissions';
      const response = await axios.get(`${API_URL}${endpoint}`, { withCredentials: true });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/quiz/${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  const handleExplore = async (topic, difficulty) => {
    if (generating) return;
    setGenerating(true);
    const toastId = toast.loading(`Generating ${topic} quiz...`);
    
    try {
      const response = await axios.post(`${API_URL}/api/generate-quiz`, {
        topic: topic,
        numQuestions: 5,
        difficulty: difficulty.toLowerCase()
      }, {
        withCredentials: true
      });
      
      toast.success("Quiz generated!", { id: toastId });
      navigate(`/quiz/${response.data.shareableCode}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error(error.response?.data?.error || "Failed to generate quiz", { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {user.role === 'teacher' ? 'My Quizzes' : 'Dashboard'}
          </h1>
          <p className="text-slate-400">
            {user.role === 'teacher' 
              ? 'Manage and track your generated quizzes' 
              : 'Track your learning progress and explore new topics'}
          </p>
        </div>
        {user.role === 'teacher' && (
           <Link to="/create-quiz" className="btn-primary">
             + New Quiz
           </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading your content...</div>
      ) : (
        <>
          {user.role === 'student' && (
            <section className="space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-semibold text-primary">Explore Topics</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {EXPLORE_TOPICS.map((topic, idx) => (
                   <div key={idx} className="card hover:border-primary/50 transition-colors group flex flex-col h-full">
                     <div className="flex-1">
                       <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
                       <p className="text-sm text-slate-400 mb-4">{topic.desc}</p>
                       <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-500 mb-6">
                         <span className="bg-slate-800 px-2 py-1 rounded">{topic.difficulty}</span>
                         <span>5 Questions</span>
                       </div>
                     </div>
                     <button 
                       onClick={() => handleExplore(topic.title, topic.difficulty)}
                       disabled={generating}
                       className="w-full block text-center py-2 rounded-lg bg-slate-800 hover:bg-primary hover:text-white transition-all text-slate-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {generating ? 'Generating...' : 'Start Assessment'}
                     </button>
                   </div>
                 ))}
               </div>
            </section>
          )}

          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              {user.role === 'teacher' ? 'Recent Quizzes' : 'Your History'}
            </h2>
            
            {data.length === 0 ? (
              <div className="card py-12 text-center">
                <p className="text-slate-500 mb-4">No records found yet.</p>
                {user.role === 'teacher' && (
                   <Link to="/create-quiz" className="text-primary hover:underline">
                     Create your first quiz &rarr;
                   </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => (
                  <div key={item._id || item.submittedAt} className="card hover:shadow-2xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white truncate pr-2">
                        {item.topic || item.quizTopic}
                      </h3>
                      {user.role === 'student' && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          item.percentage >= 80 ? 'bg-green-500/20 text-green-400' :
                          item.percentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.percentage}%
                        </span>
                      )}
                      {user.role === 'teacher' && (
                         <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
                           {item.shareableCode}
                         </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Date</span>
                        <span>{new Date(item.createdAt || item.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {user.role === 'teacher' && (
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Submissions</span>
                          <span className="text-white font-medium">{item.submissionCount}</span>
                        </div>
                      )}
                      {user.role === 'student' && (
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Score</span>
                          <span className="text-white font-medium">{item.score}/{item.totalQuestions}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {user.role === 'teacher' ? (
                        <>
                          <button 
                            onClick={() => copyLink(item.shareableCode)} 
                            className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                          >
                            Copy Code
                          </button>
                          <Link 
                            to={`/quiz/${item.shareableCode}/results`} 
                            className="px-3 py-2 rounded border border-primary/30 text-primary hover:bg-primary/10 text-center text-sm font-medium transition-colors"
                          >
                            Results
                          </Link>
                        </>
                      ) : (
                         <div className="col-span-2 relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div 
                             className={`absolute top-0 left-0 h-full rounded-full ${
                               item.percentage >= 80 ? 'bg-green-500' :
                               item.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                             }`} 
                             style={{width: `${item.percentage}%`}}
                           ></div>
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
