const express = require('express');
const {
  getRegistrationForm,
  getLoginForm,
  getForgetPasswordForm,
  getProfile,

  getResetPasswordForm,
  getSuccess,
  getVerifyIndex,
  getChangePasswordForm,
  getTwoFactor,

  // PORTFOLIO
  getInvestPortfolio,
  getActivePortfolio,
  getInvestHistory,
  getShortTermForm,

  getDetailsPage,
  activation,
  getProfileVerification,
  postProfileVerification,
  uploadDocument,
  getVerificationStatus,
  getUpdateVerification,
  postUpdateVerification,
  getVerifyDetail,
  postApproval,
  postDisApproval,
  getWalletDetail,
} = require('../controller/view.controller');

const {
  register,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  isLoggedIn,

  verifyEmail,

  logout,
  changePassword,
  postTwoFactor,

  generateTwoFaCode,

  setupTwoFactor,

  disable2FA,
  verificationMiddleWare,
} = require('../controller/auth.controller');
const { updateProfile, uploadProfilePhoto } = require('./user.controller');
// const { getMe } = require('./user.controller');
const {
  getUserIndex,
  viewUser,
  deleteUser,
  createUser,
  createUsersForm,
  createUsers,
  adminUpdateProfile,
  uploadPicture,
  getVerification,
} = require('../controller/view.user');
const {
  dailyPayout,
  compoundingPayout,
} = require('../controller/paying.controller');

// const uploadDocument = require('../middleware/uploadDocument');
const router = express();

router.use(isLoggedIn);
router.patch(
  '/update-profile/:id',
  protect,
  restrictTo('admin', 'farmer'),
  updateProfile
);
router.get('/test-daily-payout', protect, dailyPayout);
router.get('/test-comp-payout', protect, compoundingPayout);

// router.post('/register', register);
router.post('/register/:referredByCode?', register);

router.post('/login', login);
//  this is a api baised url
router.post('/forget-password', forgetPassword);
router.post('/reset-password/:token', resetPassword);
// Route to handle the change password form submission
router.patch('/change-password', protect, changePassword);
router.post('/profile/update', protect, uploadProfilePhoto, updateProfile);
router.post('/change-password', protect, changePassword);

//  Admin action here to view user delete and create update user
router.get('/users', protect, restrictTo('admin'), getUserIndex);
router.post('/users/register', protect, restrictTo('admin'), createUsers);
router.get('/users/create-user', protect, restrictTo('admin'), createUsersForm);
router.get('/profile/:id', protect, restrictTo('admin'), viewUser);
router.delete('/:id', protect, deleteUser);
router.post(
  '/profile/update/:id',
  protect,
  restrictTo('admin'),
  uploadPicture,
  adminUpdateProfile
);

// router.get('/user/users', protect, restrictTo('admin'), getUserIndex);
router.get('/register/:referredByCode?', getRegistrationForm);
// router.get('/biz-register', getBizForm);

router.get('/activation', activation);
router.get('/login', getLoginForm);
router.get('/logout', logout);

router.get('/profileVerification', protect, getProfileVerification);
router.get('/update-verification', protect, getUpdateVerification);
router.post(
  '/update-verification',
  protect,
  uploadDocument,
  postUpdateVerification
);

router.get('/verify-email/:token', verifyEmail);

router.get('/reset-password/:token', getResetPasswordForm);

router.post(
  '/profile-verification',
  protect,
  uploadDocument,
  postProfileVerification
);
router.get('/verification-status', protect, getVerificationStatus);
router.use(protect, verificationMiddleWare);
// router.get()
// GET ME ROUTE
router.get('/profile', protect, getProfile);
router.get('/verification', protect, getVerification);

router.get('/forget-password', getForgetPasswordForm);
// Route to display the change password form
router.get('/change-password', protect, getChangePasswordForm);

router.post('/two-factor', protect, postTwoFactor);
router.get('/two-factor', getTwoFactor);

// first step
router.get('/2fa-generate', protect, generateTwoFaCode);
// router.post('/2fa-enable', protect, enable2FA);
router.post('/2fa-disable', protect, disable2FA);
router.post('/2fa-setup', protect, setupTwoFactor);
router.post('/2fa-verify', login);
router.get('/success', getSuccess);

router.get('/user-verify-status', protect, restrictTo('admin'), getVerifyIndex);
router.post('/approve/:id', protect, restrictTo('admin'), postApproval);
router.post('/disapprove/:id', protect, restrictTo('admin'), postDisApproval);
router.get(
  '/user-verify-detail/:id',
  protect,
  restrictTo('admin'),
  getVerifyDetail
);

// PORTFOLIO
router.get('/view-investments-portfolio', protect, getInvestPortfolio);
router.get('/user-investments', protect, getActivePortfolio);
router.post('/get-wallet-details', protect, getWalletDetail);
router.get('/investment-history', protect, getInvestHistory);
router.get('/short-term-funds', protect, getShortTermForm);
router.get('/portfolio-details', protect, getDetailsPage);

module.exports = router;
