const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // Now required
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(arr) {
          return arr.length === 4;
        },
        message: 'Each question must have exactly 4 options'
      }
    },
    correctAnswer: {
      type: String,
      required: true
    }
  }],
  shareableCode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);