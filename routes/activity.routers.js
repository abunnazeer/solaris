const express = require('express');
// const slugify = require('slugify');

const {
  getActivity,
  getTransfer,
  postWithdrawal,
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
module.exports = router;
