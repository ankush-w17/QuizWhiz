const { auth, isTeacher } = require("./middleware/auth.jsx");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db"); // Import DB connection
const Quiz = require("./models/Quiz"); // Import Quiz model
const Submission = require("./models/Submission"); // Import Submission model

const app = express();
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://quiz-whiz-sandy.vercel.app"]
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Utility function to generate random shareable code
function generateShareableCode() {
  return Math.random().toString(36).substring(2, 10); // Random 8-char string
}

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Generate quiz and SAVE to database
// Generate quiz and SAVE to database (PROTECTED - Teachers only)
app.post("/api/generate-quiz", auth, isTeacher, async (req, res) => {
  try {
    const { topic, numQuestions } = req.body;
    const quizTopic = topic || "general knowledge";
    const questionCount = numQuestions || 5;

    // Call AI API (same as before)
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
            content: `Create a ${questionCount}-question multiple choice quiz about ${quizTopic}. Format: {"questions": [{"question": "...", "options": ["a", "b", "c", "d"], "correctAnswer": "a"}]}`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const quizData = JSON.parse(response.data.choices[0].message.content);

    // Generate unique shareable code
    let shareableCode;
    let isUnique = false;
    while (!isUnique) {
      shareableCode = generateShareableCode();
      const existing = await Quiz.findOne({ shareableCode });
      if (!existing) isUnique = true;
    }

    // Save to database WITH teacherId
    const newQuiz = new Quiz({
      teacherId: req.userId, // From auth middleware
      topic: quizTopic,
      questions: quizData.questions,
      shareableCode: shareableCode,
    });

    await newQuiz.save();

    // Return quiz with shareable code
    res.json({
      quizId: newQuiz._id,
      shareableCode: shareableCode,
      topic: quizTopic,
      questions: quizData.questions,
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Get quiz by shareable code (for students)
// Get quiz by shareable code (for students)
app.get("/api/quiz/:code", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check if student already submitted
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

    // Don't send correct answers
    const quizForStudent = {
      quizId: quiz._id,
      topic: quiz.topic,
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
});

// Submit quiz answers
// Submit quiz answers
// Submit quiz answers (students)
app.post("/api/quiz/:code/submit", auth, async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findOne({ shareableCode: req.params.code });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check if student already submitted
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
      studentId: req.userId,
      studentName: req.user.name,
      answers: answers,
      score: score,
    });

    await submission.save();

    res.json({
      score: score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

// Get all submissions for a quiz (for teacher)
// Get all submissions for a quiz (for teacher who created it)
app.get("/api/quiz/:code/results", auth, isTeacher, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareableCode: req.params.code });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check if this teacher owns the quiz
    if (quiz.teacherId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const submissions = await Submission.find({ quizId: quiz._id }).sort({
      submittedAt: -1,
    });

    res.json({
      topic: quiz.topic,
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
});

// ============ AUTH ROUTES ============

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["teacher", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(401).json({ error: `Please login as ${user.role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Get current user
app.get("/api/auth/me", async (req, res) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Get all quizzes created by the logged-in teacher
// Get all quizzes created by the logged-in teacher WITH submission counts
app.get("/api/teacher/quizzes", auth, isTeacher, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.userId })
      .sort({ createdAt: -1 })
      .select("topic shareableCode createdAt");

    // Get submission counts for each quiz
    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        const submissionCount = await Submission.countDocuments({
          quizId: quiz._id,
        });
        return {
          _id: quiz._id,
          topic: quiz.topic,
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
});

// Get student's submission history
app.get("/api/student/submissions", auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.userId })
      .populate("quizId", "topic createdAt")
      .sort({ submittedAt: -1 });

    res.json(
      submissions.map((s) => ({
        quizTopic: s.quizId?.topic || "Deleted Quiz",
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
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
