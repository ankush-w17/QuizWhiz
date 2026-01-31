const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth, isTeacher } = require('../middleware/auth');

// Teacher Routes
router.post('/generate-quiz', auth, quizController.generateQuiz);
router.get('/teacher/quizzes', auth, isTeacher, quizController.getTeacherQuizzes);
router.get('/quiz/:code/results', auth, isTeacher, quizController.getQuizResults);

// Student/Quiz Taking Routes
router.get('/quiz/:code', auth, quizController.getQuizByCode);
router.post('/quiz/:code/submit', auth, quizController.submitQuiz);
router.get('/student/submissions', auth, quizController.getStudentSubmissions);

module.exports = router;
