const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      selectedOptionIndex: {
        type: Number,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }
  ],
  score: {
    type: Number,
    required: true // Percentage scored, e.g. 80
  },
  correctAnswersCount: {
    type: Number,
    required: true
  },
  totalQuestionsCount: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attempt', AttemptSchema);
