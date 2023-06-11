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
  getDetailsPage,
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
  // activateAccount,
  verifyEmail,
  // logout,
  logout,
  changePassword,
} = require('../controller/auth.controller');

const router = express();

router.use(isLoggedIn);

router.patch(
  '/update-profile/:id',
  protect,
  restrictTo('admin', 'farmer'),
  updateProfile
);
// api end point routes
router.post('/user/register', register);
router.post('/user/login', login);
//  this is a api baised url
router.post('/user/forget-password', forgetPassword);
router.post('/user/reset-password/:token', resetPassword);
// Route to handle the change password form submission
router.patch('/user/change-password', protect, changePassword);
// router.post('/user/change-password', protect, changePassword);

//  this render the view of user forms
router.get('/user/register', getRegistrationForm);
router.get('/user/biz-register', getBizForm);

router.get('/user/login', getLoginForm);
router.get('/logout', logout);

router.get('/user/profile', protect, getProfile);
router.get('/user/forget-password', getForgetPasswordForm);
// Route to display the change password form
router.get('/user/change-password', protect, getChangePasswordForm);

router.get('/user/two-factor', getTwoFactor);
router.get('/user/activation', getActivation);
router.get('/user/registration', getRegOption);

router.get('/user/reset-password/:token', getResetPasswordForm);
router.get('/user/verify-email/:token', verifyEmail);

// activty routes
router.get('/user/activity', getActivity);
router.get('/user/transfer', getTransfer);

// PORTFOLIO
router.get('/user/view-investments-portfolio', getInvestPortfolio);
router.get('/user/user-investments', getUSerInvest);
router.get('/user/investment-history', getInvestHistory);
router.get('/user/short-term-funds', getShortTermForm);
router.get('/user/portfolio-details', getDetailsPage);
// REFERRAL VIEW
router.get('/user/referred-users', getReferral);
router.get('/user/referral-bonus', getReferralBunus);
// Withdrawal Routes
router.get('/user/withdrawal-request', getWithdrawalRequest);
router.get('/user/withdrawal-history', getwithdrawalHistory);
// router.delete('/update-profile/:id', protect, updateProfile);

module.exports = router;
