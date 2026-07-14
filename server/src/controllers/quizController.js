const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Get quizzes (with filters & search)
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10, showAll } = req.query;

    const query = {};
    if (showAll !== 'true') {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quizzes = await Quiz.find(query)
      .populate('category', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Quiz.countDocuments(query);

    // Append question counts to each quiz object
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.countDocuments({ quizId: quiz._id });
        return {
          ...quiz.toObject(),
          questionCount
        };
      })
    );

    res.json({
      quizzes: quizzesWithCount,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz details (general public info)
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('category', 'name');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questionCount = await Question.countDocuments({ quizId: quiz._id });
    res.json({
      ...quiz.toObject(),
      questionCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz questions for quiz execution (SECURED - Excludes correctOptionIndex & explanation)
// @route   GET /api/quizzes/:id/questions
// @access  Private
const getQuizQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ message: 'Quiz not found or inactive' });
    }

    // Find questions and exclude correct index and explanation
    const questions = await Question.find({ quizId: req.params.id })
      .select('-correctOptionIndex -explanation');

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private/Admin
const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, timeLimit, passPercentage } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      timeLimit: parseInt(timeLimit),
      passPercentage: parseInt(passPercentage) || 50
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
const updateQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, timeLimit, passPercentage, isActive } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.category = category || quiz.category;
    quiz.difficulty = difficulty || quiz.difficulty;
    quiz.timeLimit = timeLimit !== undefined ? parseInt(timeLimit) : quiz.timeLimit;
    quiz.passPercentage = passPercentage !== undefined ? parseInt(passPercentage) : quiz.passPercentage;
    quiz.isActive = isActive !== undefined ? isActive : quiz.isActive;

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Trigger schema pre middleware for cascade deletion
    await Quiz.deleteOne({ _id: req.params.id });

    res.json({ message: 'Quiz and associated questions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  getQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz
};
