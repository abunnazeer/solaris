const express = require('express');
const {
  getRegistrationForm,
  getLoginForm,
  getForgetPasswordForm,
  getProfile,
  getBizForm,
  getResetPasswordForm,
  getSuccess,
  getRegOption,
  getChangePasswordForm,
  getTwoFactor,

  // Activity
  getActivity,
  getTransfer,
  // PORTFOLIO
  getInvestPortfolio,
  getActivePortfolio,
  getInvestHistory,
  getShortTermForm,
  getDetailsPage,
  // REFERRAL
  getReferral,
  getReferralBunus,
  // withdrawal
  getWithdrawalRequest,
  getwithdrawalHistory,
  dashboard,
} = require('../controller/auth.view');

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
const { updateProfile, uploadProfilePhoto } = require('./user.controller');
// const { getMe } = require('./user.controller');
const {
  getUserIndex,
  viewUser,
  deleteUser,

  createUsersForm,
  createUsers,
  adminUpdateProfile,
  uploadPicture,
} = require('../controller/view.user');
const router = express();

router.use(isLoggedIn);

router.patch(
  '/update-profile/:id',
  protect,
  restrictTo('admin', 'farmer'),
  updateProfile
);

// router.post('/register', register);
router.post('/register/:reCode?', register);

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
router.get('/register/:reCode?', getRegistrationForm);
// router.get('/biz-register', getBizForm);

router.get('/login', getLoginForm);
router.get('/logout', logout);

// router.get()
// GET ME ROUTE
router.get('/profile', protect, getProfile);

router.get('/forget-password', getForgetPasswordForm);
// Route to display the change password form
router.get('/change-password', protect, getChangePasswordForm);

router.get('/two-factor', getTwoFactor);
router.get('/success', getSuccess);
router.get('/registration', getRegOption);

router.get('/reset-password/:token', getResetPasswordForm);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
