const express = require('express');
const router = express.Router();
const {
  getQuizQuestionsAdmin,
  addQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, addQuestion);

router.route('/:id')
  .put(protect, admin, updateQuestion)
  .delete(protect, admin, deleteQuestion);

router.route('/quiz/:quizId')
  .get(protect, admin, getQuizQuestionsAdmin);

module.exports = router;
