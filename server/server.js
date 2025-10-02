const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');  // Import DB connection
const Quiz = require('./models/Quiz');  // Import Quiz model
const Submission = require('./models/Submission');  // Import Submission model

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Utility function to generate random shareable code
function generateShareableCode() {
  return Math.random().toString(36).substring(2, 10);  // Random 8-char string
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Generate quiz and SAVE to database
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, numQuestions } = req.body;
    const quizTopic = topic || 'general knowledge';
    const questionCount = numQuestions || 5;

    // Call AI API (same as before)
    const response = await axios.post(
      'https://models.github.ai/inference/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a quiz generator. Generate quizzes in valid JSON format only. Return ONLY the JSON, no additional text.'
          },
          {
            role: 'user',
            content: `Create a ${questionCount}-question multiple choice quiz about ${quizTopic}. Format: {"questions": [{"question": "...", "options": ["a", "b", "c", "d"], "correctAnswer": "a"}]}`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const quizData = JSON.parse(response.data.choices[0].message.content);

    // Generate unique shareable code
    let shareableCode;
    let isUnique = false;
    while (!isUnique) {
      shareableCode = generateShareableCode();
      const existing = await Quiz.findOne({ shareableCode });
      if (!existing) isUnique = true;  // Code is unique
    }

    // Save to database
    const newQuiz = new Quiz({
      topic: quizTopic,
      questions: quizData.questions,
      shareableCode: shareableCode
    });

    await newQuiz.save();  // Saves to MongoDB

    // Return quiz with shareable code
    res.json({
      quizId: newQuiz._id,
      shareableCode: shareableCode,
      topic: quizTopic,
      questions: quizData.questions
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Get quiz by shareable code (for students)
app.get('/api/quiz/:code', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Don't send correct answers to students
    const quizForStudent = {
      quizId: quiz._id,
      topic: quiz.topic,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options
        // correctAnswer intentionally omitted
      }))
    };

    res.json(quizForStudent);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Submit quiz answers
app.post('/api/quiz/:code/submit', async (req, res) => {
  try {
    const { studentName, answers } = req.body;
    
    // Find quiz
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    // Save submission
    const submission = new Submission({
      quizId: quiz._id,
      studentName: studentName,
      answers: answers,
      score: score
    });

    await submission.save();

    res.json({
      score: score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100)
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get all submissions for a quiz (for teacher)
app.get('/api/quiz/:code/results', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const submissions = await Submission.find({ quizId: quiz._id })
      .sort({ submittedAt: -1 });  // Newest first

    res.json({
      topic: quiz.topic,
      totalQuestions: quiz.questions.length,
      submissions: submissions.map(s => ({
        studentName: s.studentName,
        score: s.score,
        percentage: Math.round((s.score / quiz.questions.length) * 100),
        submittedAt: s.submittedAt
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});