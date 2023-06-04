const express = require('express');
const {
  getRegistrationForm,
  getLoginForm,
  getForgetPasswordForm,
  getProfile,
  getBizForm,
  getResetPasswordForm,
  getActivation,
  getRegOption,
  getChangePasswordForm,
  getTwoFactor,
  // Activity
  getActivity,
  getTransfer,
  // PORTFOLIO
  getInvestPortfolio,
  getUSerInvest,
  getInvestHistory,
  getShortTermForm,
  // REFERRAL
  getReferral,
  getReferralBunus,
  // withdrawal
  getWithdrawalRequest,
  getwithdrawalHistory,
} = require('../controller/view.controller');

const { updateProfile } = require('./profile.controller');
const {
  register,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  isLoggedIn,
  activateAccount,
  logout,
} = require('../controller/auth.controller');

const router = express();

router.use(isLoggedIn);
router.post('/register', register);

router.post('/login', login);
router.patch(
  '/update-profile/:id',
  protect,
  restrictTo('admin', 'farmer'),
  updateProfile
);

router.post('/forget-password', forgetPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/user/register', getRegistrationForm);
router.get('/user/biz-register', getBizForm);
router.get('/user/login', getLoginForm);
router.get('/user/logout', logout);
router.get('/user/profile', protect, getProfile);
router.get('/user/forget-password', getForgetPasswordForm);
router.get('/user/change-password', getChangePasswordForm);
router.get('/user/two-factor', getTwoFactor);
router.get('/user/activation', getActivation);
router.get('/user/registration', getRegOption);
router.get('/user/reset-password/:token', getResetPasswordForm);

// activty routes
router.get('/user/activity', getActivity);
router.get('/user/transfer', getTransfer);

// PORTFOLIO
router.get('/user/view-investments-portfolio', getInvestPortfolio);
router.get('/user/user-investments', getUSerInvest);
router.get('/user/investment-history', getInvestHistory);
router.get('/user/short-term-funds', getShortTermForm);
// REFERRAL VIEW
router.get('/user/referred-users', getReferral);
router.get('/user/referral-bonus', getReferralBunus);
// Withdrawal Routes
router.get('/user/withdrawal-request', getWithdrawalRequest);
router.get('/user/withdrawal-history', getwithdrawalHistory);
// router.delete('/update-profile/:id', protect, updateProfile);

module.exports = router;
