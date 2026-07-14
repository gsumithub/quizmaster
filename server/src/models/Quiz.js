const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number,
    required: [true, 'Please add a time limit (in seconds)'],
    min: [10, 'Time limit must be at least 10 seconds']
  },
  passPercentage: {
    type: Number,
    default: 50,
    min: [0, 'Pass percentage cannot be negative'],
    max: [100, 'Pass percentage cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete questions when a quiz is deleted
QuizSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await this.model('Question').deleteMany({ quizId: this._id });
  next();
});

module.exports = mongoose.model('Quiz', QuizSchema);
