const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// @desc    Get all questions for a quiz (Admin only - includes answers/explanations)
// @route   GET /api/questions/quiz/:quizId
// @access  Private/Admin
const getQuizQuestionsAdmin = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a question to a quiz
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = async (req, res) => {
  try {
    const { text, options, correctOptionIndex, explanation, quizId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = await Question.create({
      text,
      options,
      correctOptionIndex: parseInt(correctOptionIndex),
      explanation,
      quizId
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const { text, options, correctOptionIndex, explanation } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.text = text || question.text;
    question.options = options || question.options;
    question.correctOptionIndex = correctOptionIndex !== undefined ? parseInt(correctOptionIndex) : question.correctOptionIndex;
    question.explanation = explanation !== undefined ? explanation : question.explanation;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuizQuestionsAdmin,
  addQuestion,
  updateQuestion,
  deleteQuestion
};
