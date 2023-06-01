const express = require('express');
const {
  getRegistrationForm,
  getLoginForm,
  getForgetPasswordForm,
  getProfile,
  getBizForm,
  getResetPasswordForm,
  getActivation,
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
} = require('../controller/auth.controller');

const router = express();

// router.use(isLoggedIn);
router.post('/register', register);
// router.post('/activate-account', activateAccount);
router.post('/login', login);
router.patch(
  '/update-profile/:id',
  protect,
  restrictTo('admin', 'farmer'),
  updateProfile
);

router.post('/forget-password', forgetPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/register', getRegistrationForm);
router.get('/biz-register', getBizForm);
router.get('/login', getLoginForm);
router.get('/profile', getProfile);
router.get('/forget-password', getForgetPasswordForm);
router.get('/activation', getActivation);
router.get('/reset-password/:token', getResetPasswordForm);
// router.post('/dashboard', protect);

// const { getRegistrationFrom } = require('./user.view.controller');

// router.get('/signup', getRegistrationFrom);

// router.delete('/update-profile/:id', protect, updateProfile);

module.exports = router;
