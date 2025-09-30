const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const model = "gpt-4o-mini";

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// AI quiz generation endpoint
// AI quiz generation endpoint
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, numQuestions } = req.body;
    const quizTopic = topic || 'general knowledge';
    const questionCount = numQuestions || 5;

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
    res.json(quizData);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});