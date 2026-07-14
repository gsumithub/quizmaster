const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Submit a quiz attempt
// @route   POST /api/attempts
// @access  Private
const submitAttempt = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers = [{ questionId, selectedOptionIndex }]

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get all correct questions from database
    const dbQuestions = await Question.find({ quizId });
    if (dbQuestions.length === 0) {
      return res.status(400).json({ message: 'Quiz has no questions yet' });
    }

    let correctAnswersCount = 0;
    const evaluatedAnswers = dbQuestions.map((q) => {
      // Find user answer for this question
      const userAnswer = answers.find((ans) => ans.questionId === q._id.toString());
      const selectedIndex = userAnswer ? userAnswer.selectedOptionIndex : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;

      if (isCorrect) {
        correctAnswersCount++;
      }

      return {
        questionId: q._id,
        selectedOptionIndex: selectedIndex,
        isCorrect
      };
    });

    const totalQuestionsCount = dbQuestions.length;
    const score = Math.round((correctAnswersCount / totalQuestionsCount) * 100);
    const passed = score >= quiz.passPercentage;

    const attempt = await Attempt.create({
      user: req.user.id,
      quiz: quizId,
      answers: evaluatedAnswers,
      score,
      correctAnswersCount,
      totalQuestionsCount,
      passed
    });

    // Send attempt detail with full question answers populated for feedback
    const detailedAttempt = await Attempt.findById(attempt._id)
      .populate('quiz', 'title description passPercentage timeLimit')
      .populate({
        path: 'answers.questionId',
        select: 'text options correctOptionIndex explanation'
      });

    res.status(201).json(detailedAttempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's quiz attempts history
// @route   GET /api/attempts/my-attempts
// @access  Private
const getUserAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .populate({
        path: 'quiz',
        select: 'title difficulty',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ completedAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed single attempt result
// @route   GET /api/attempts/:id
// @access  Private
const getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate({
        path: 'quiz',
        select: 'title description passPercentage timeLimit',
        populate: { path: 'category', select: 'name' }
      })
      .populate({
        path: 'answers.questionId',
        select: 'text options correctOptionIndex explanation'
      });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt record not found' });
    }

    // Ensure users can only view their own attempts (admins can view any)
    if (attempt.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this record' });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user dashboard analytics
// @route   GET /api/attempts/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .populate({
        path: 'quiz',
        select: 'category title',
        populate: { path: 'category', select: 'name' }
      });

    const totalQuizzesPlayed = attempts.length;

    if (totalQuizzesPlayed === 0) {
      return res.json({
        totalQuizzesPlayed: 0,
        averageScore: 0,
        passRate: 0,
        categoryPerformance: [],
        recentAttempts: []
      });
    }

    // Calculate average score and pass rate
    const sumScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = Math.round(sumScore / totalQuizzesPlayed);

    const passedCount = attempts.filter(a => a.passed).length;
    const passRate = Math.round((passedCount / totalQuizzesPlayed) * 100);

    // Group by category to find category performance
    const categoryStats = {};
    attempts.forEach((attempt) => {
      if (attempt.quiz && attempt.quiz.category) {
        const catName = attempt.quiz.category.name;
        if (!categoryStats[catName]) {
          categoryStats[catName] = { scoreSum: 0, count: 0 };
        }
        categoryStats[catName].scoreSum += attempt.score;
        categoryStats[catName].count += 1;
      }
    });

    const categoryPerformance = Object.keys(categoryStats).map((catName) => ({
      name: catName,
      avgScore: Math.round(categoryStats[catName].scoreSum / categoryStats[catName].count),
      count: categoryStats[catName].count
    }));

    // Sort recent attempts
    const recentAttempts = attempts
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 5)
      .map(a => ({
        _id: a._id,
        quizTitle: a.quiz ? a.quiz.title : 'Deleted Quiz',
        score: a.score,
        passed: a.passed,
        completedAt: a.completedAt
      }));

    res.json({
      totalQuizzesPlayed,
      averageScore,
      passRate,
      categoryPerformance,
      recentAttempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overall stats for admin dashboard
// @route   GET /api/attempts/admin-stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQuizzes = await Quiz.countDocuments({});
    const totalAttempts = await Attempt.countDocuments({});

    const allAttempts = await Attempt.find({});
    const sumScore = allAttempts.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = totalAttempts > 0 ? Math.round(sumScore / totalAttempts) : 0;

    const passedCount = allAttempts.filter(a => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

    // Get 10 most recent attempts across all users
    const recentAttempts = await Attempt.find({})
      .populate('user', 'username email')
      .populate('quiz', 'title')
      .sort({ completedAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalQuizzes,
      totalAttempts,
      averageScore,
      passRate,
      recentAttempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitAttempt,
  getUserAttempts,
  getAttemptById,
  getDashboardStats,
  getAdminStats
};
