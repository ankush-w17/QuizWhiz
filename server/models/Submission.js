const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,  // References Quiz._id
    ref: 'Quiz',  // Links to Quiz model
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  answers: {
    type: [String],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0  // Can't be negative
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);