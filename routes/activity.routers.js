const express = require('express');
// const slugify = require('slugify');

const {
  getActivity,
  getTransfer,
  postWithdrawal,
  getWithdrawalRequest,
  getwithdrawalHistory,
  getwithdrawalStatus,
  getVerifyWithdrawal,
  getVerifyDetails,
  postVerifyWithdrawal,
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
router.get('/withdrawal-status', protect, getwithdrawalStatus);
router.get(
  '/verify-withdrawal',
  protect,
  restrictTo('admin'),
  getVerifyWithdrawal
);
router.get(
  '/verify-details/:id',
  protect,
  restrictTo('admin'),
  getVerifyDetails
);
router.post(
  '/approve-payment/:paramId',
  protect,
  restrictTo('admin'),
  postVerifyWithdrawal
);
// router.delete('/update-profile/:id', protect, updateProfile);
module.exports = router;
