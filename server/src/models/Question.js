const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add the question text'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Please add at least two options'],
    validate: {
      validator: function (val) {
        return val.length >= 2;
      },
      message: 'A question must have at least two options'
    }
  },
  correctOptionIndex: {
    type: Number,
    required: [true, 'Please specify the correct option index'],
    min: [0, 'Correct option index cannot be negative'],
    validate: {
      validator: function (val) {
        return val < this.options.length;
      },
      message: 'Correct option index must be within options range'
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Please associate this question with a quiz']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
