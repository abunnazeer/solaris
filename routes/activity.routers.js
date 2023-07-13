const express = require('express');
// const slugify = require('slugify');

const {
  getActivity,
  getTransfer,
  postWithdrawal,
  getWithdrawalRequest,
  getwithdrawalHistory,
} = require('../controller/activity.controller');
const {
  restrictTo,
  isLoggedIn,
  protect,
} = require('../controller/auth.controller');

const router = express.Router();

router.use(isLoggedIn);

// Route to handle the update request
router.get('/activity', protect, getActivity);

router.post('/withdrawal', protect, postWithdrawal);
// View single portfolio
router.get('/transfer', protect, getTransfer);

// Withdrawal Routes
router.get('/withdrawal-request', protect, getWithdrawalRequest);
router.get('/withdrawal-history', protect, getwithdrawalHistory);
// router.delete('/update-profile/:id', protect, updateProfile);
module.exports = router;
