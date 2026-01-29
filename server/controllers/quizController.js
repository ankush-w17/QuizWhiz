const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const axios = require('axios');

function generateShareableCode() {
  return Math.random().toString(36).substring(2, 10);
}

exports.generateQuiz = async (req, res) => {
  try {
    const { topic, numQuestions, difficulty } = req.body;
    const quizTopic = topic || "general knowledge";
    const questionCount = numQuestions || 5;
    const quizDifficulty = difficulty || "medium";

    const prompt = `Create a ${questionCount}-question multiple choice quiz about ${quizTopic} at a ${quizDifficulty} difficulty level. Format: {"questions": [{"question": "...", "options": ["a", "b", "c", "d"], "correctAnswer": "a"}]}`;

    const response = await axios.post(
      "https://models.github.ai/inference/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a quiz generator. Generate quizzes in valid JSON format only. Return ONLY the JSON, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: quizDifficulty === 'hard' ? 0.9 : 0.7, // Higher temp for creative hard questions
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let quizData;
    try {
        // Sometimes models return markdown blocks
        const rawContent = response.data.choices[0].message.content;
        const jsonContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        quizData = JSON.parse(jsonContent);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return res.status(500).json({ error: "Failed to parse AI response" });
    }

    let shareableCode;
    let isUnique = false;
    while (!isUnique) {
      shareableCode = generateShareableCode();
      const existing = await Quiz.findOne({ shareableCode });
      if (!existing) isUnique = true;
    }

    const newQuiz = new Quiz({
      teacherId: req.userId,
      topic: quizTopic,
      difficulty: quizDifficulty,
      questions: quizData.questions,
      shareableCode: shareableCode,
    });

    await newQuiz.save();

    res.json({
      quizId: newQuiz._id,
      shareableCode: shareableCode,
      topic: quizTopic,
      difficulty: quizDifficulty,
      questions: quizData.questions,
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
};

exports.getQuizByCode = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const existingSubmission = await Submission.findOne({
      quizId: quiz._id,
      studentId: req.userId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        error: "You have already submitted this quiz",
        alreadySubmitted: true,
      });
    }

    const quizForStudent = {
      quizId: quiz._id,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: quiz.questions.map((q) => ({
        question: q.question,
        options: q.options,
      })),
    };

    res.json(quizForStudent);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (req.user.role === "student") {
      const existingSubmission = await Submission.findOne({
        quizId: quiz._id,
        studentId: req.userId,
      });

      if (existingSubmission) {
        return res.status(400).json({
          error: "You have already submitted this quiz",
          alreadySubmitted: true,
        });
      }
    }

    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    const submission = new Submission({
      quizId: quiz._id,
      studentId: req.userId,
      studentName: req.user.name,
      answers: answers,
      score: score,
    });

    await submission.save();

    // Reward XP based on difficulty
    const xpMultiplier = quiz.difficulty === 'hard' ? 2 : (quiz.difficulty === 'medium' ? 1.5 : 1);
    const xpEarned = Math.round(score * 10 * xpMultiplier); // Example XP logic

    res.json({
      score: score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      xpEarned: xpEarned 
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.teacherId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const submissions = await Submission.find({ quizId: quiz._id }).sort({
      submittedAt: -1,
    });

    res.json({
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      totalQuestions: quiz.questions.length,
      submissions: submissions.map((s) => ({
        studentName: s.studentName,
        score: s.score,
        percentage: Math.round((s.score / quiz.questions.length) * 100),
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

exports.getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.userId })
      .sort({ createdAt: -1 })
      .select("topic shareableCode difficulty createdAt");

    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        const submissionCount = await Submission.countDocuments({
          quizId: quiz._id,
        });
        return {
          _id: quiz._id,
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          shareableCode: quiz.shareableCode,
          createdAt: quiz.createdAt,
          submissionCount: submissionCount,
        };
      })
    );

    res.json(quizzesWithCounts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

exports.getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.userId })
      .populate("quizId", "topic difficulty createdAt")
      .sort({ submittedAt: -1 });

    res.json(
      submissions.map((s) => ({
        quizTopic: s.quizId?.topic || "Deleted Quiz",
        quizDifficulty: s.quizId?.difficulty || "N/A",
        score: s.score,
        totalQuestions: s.answers.length,
        percentage: Math.round((s.score / s.answers.length) * 100),
        submittedAt: s.submittedAt,
      }))
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};
