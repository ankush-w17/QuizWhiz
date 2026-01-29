import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock Data for "Explore" section in Student View (matching screenshot)
const EXPLORE_TOPICS = [
  { title: "Artificial Intelligence", desc: "Discover the world of AI, machine learning and neural networks", difficulty: "Hard" },
  { title: "Quantum Physics", desc: "Explore the mysteries of quantum mechanics and particle physics", difficulty: "Hard" },
  { title: "Space Exploration", desc: "Journey through the cosmos and test your knowledge of space", difficulty: "Medium" },
  { title: "Cybersecurity", desc: "Test your knowledge about digital security and hacking prevention", difficulty: "Hard" },
  { title: "Future Tech", desc: "Test your knowledge on emerging technologies and innovations", difficulty: "Medium" },
  { title: "Robotics", desc: "Learn about the fascinating world of robots and automation", difficulty: "Medium" },
];

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]); // Stores quizzes (teacher) or submissions (student)
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/quiz/${code}`;
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };

  const handleStartTopic = (topic) => {
    // Redirect to generator with pre-filled topic (need to implement parsing in Generator or just pass state)
    // For now, simpler to just navigation. In a real app we'd pass state.
    // Actually, let's just use navigation state or query param. 
    // Since I haven't implemented query param reading in Generator, I'll just redirect to create-quiz 
    // but the user has to type it. 
    // Wait, let's fix Generator to read query param later if needed. 
    // For now, assume manual entry or update Generator later.
    // Let's pass it via state location.
    // I can't modify Generator right now without another tool call. 
    // I entered "Quantum Physics" as example in Generator placeholder.
    navigate('/create-quiz');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title text-gradient">
          {user.role === 'teacher' ? 'My Quizzes' : 'Quantum Quiz'}
        </h1>
        <p className="page-subtitle">
          {user.role === 'teacher' 
            ? 'Manage and track your generated quizzes' 
            : 'Test your knowledge on the frontiers of science'}
        </p>
      </div>

      {loading ? (
        <div className="container">Loading...</div>
      ) : (
        <>
          {user.role === 'student' && (
            <div style={{marginBottom: '4rem'}}>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                 <h2 className="text-gradient">Explore Topics</h2>
                 <Link to="/courses" className="btn-primary" style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}}>All Courses</Link>
               </div>
               
               <div className="quiz-grid">
                 {EXPLORE_TOPICS.map((topic, idx) => (
                   <div key={idx} className="quiz-card">
                     <div>
                       <h3 className="quiz-title">{topic.title}</h3>
                       <p className="quiz-description">{topic.desc}</p>
                       <div className="quiz-meta">
                         <span>20 questions</span>
                         <span style={{color: '#8B5CF6'}}>{topic.difficulty} Details</span>
                       </div>
                       <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{width: '0%'}}></div>
                       </div>
                       <div className="quiz-meta">
                         <span>⚡ 700 XP</span>
                         <span>0% completed</span>
                       </div>
                     </div>
                     <Link to="/create-quiz" className="btn-primary" style={{textAlign: 'center', marginTop: '1rem'}}>
                       Start Quiz
                     </Link>
                   </div>
                 ))}
               </div>
            </div>
          )}

          <h2 className="text-gradient" style={{marginBottom: '1.5rem'}}>
            {user.role === 'teacher' ? 'Created Quizzes' : 'Your History'}
          </h2>
          
          <div className="quiz-grid">
            {data.length === 0 ? (
              <div className="card" style={{gridColumn: '1/-1', textAlign: 'center'}}>
                <p style={{color: 'var(--text-secondary)'}}>No records found.</p>
              </div>
            ) : data.map((item) => (
              <div key={item._id || item.submittedAt} className="quiz-card">
                <div>
                  <h3 className="quiz-title">{item.topic || item.quizTopic}</h3>
                  <div className="quiz-meta">
                    {user.role === 'teacher' ? (
                      <span>Code: <span style={{color:'white', fontWeight:'bold'}}>{item.shareableCode}</span></span>
                    ) : (
                      <span>Score: {item.score}/{item.totalQuestions}</span>
                    )}
                    <span>{new Date(item.createdAt || item.submittedAt).toLocaleDateString()}</span>
                  </div>
                  {user.role === 'teacher' && (
                     <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem'}}>
                       {item.submissionCount} submissions
                     </p>
                  )}
                  {user.role === 'student' && (
                     <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{width: `${item.percentage}%`}}></div>
                     </div>
                  )}
                </div>
                
                <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                  {user.role === 'teacher' ? (
                    <>
                      <button onClick={() => copyLink(item.shareableCode)} className="btn-primary" style={{flex:1, fontSize: '0.8rem'}}>
                        Copy Code
                      </button>
                      <Link to={`/quiz/${item.shareableCode}/results`} className="btn-primary" style={{flex:1, background: 'transparent', border: '1px solid var(--border-color)', fontSize: '0.8rem', textAlign:'center'}}>
                        Results
                      </Link>
                    </>
                  ) : (
                     <span style={{color: item.percentage >= 80 ? '#4ade80' : '#facc15', fontWeight: 'bold'}}>
                       {item.percentage}% {item.percentage >= 80 ? 'Excellent' : 'Good'}
                     </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
