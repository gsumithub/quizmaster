const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  getQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getQuizzes)
  .post(protect, admin, createQuiz);

router.route('/:id')
  .get(getQuizById)
  .put(protect, admin, updateQuiz)
  .delete(protect, admin, deleteQuiz);

router.route('/:id/questions')
  .get(protect, getQuizQuestions);

module.exports = router;
