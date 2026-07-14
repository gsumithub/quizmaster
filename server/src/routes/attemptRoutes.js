const express = require('express');
const router = express.Router();
const {
  submitAttempt,
  getUserAttempts,
  getAttemptById,
  getDashboardStats,
  getAdminStats
} = require('../controllers/attemptController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, submitAttempt);

router.route('/my-attempts')
  .get(protect, getUserAttempts);

router.route('/dashboard-stats')
  .get(protect, getDashboardStats);

router.route('/admin-stats')
  .get(protect, admin, getAdminStats);

router.route('/:id')
  .get(protect, getAttemptById);

module.exports = router;
