const express = require('express');
const {
  register,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  getRegistrationForm,
  getLoginForm,
  getForgetPasswordForm,
  getProfile,
  getBizForm,
  getResetPasswordForm,
  getActivation,
} = require('./user.controller');
const { updateProfile } = require('./profile.controller');

const router = express();
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

router.get('/register', getRegistrationForm);
router.get('/biz-register', getBizForm);
router.get('/login', getLoginForm);
router.get('/profile', getProfile);
router.get('/forget-password', getForgetPasswordForm);
router.get('/activation', getActivation);
router.get('/reset-password/:token', getResetPasswordForm);

// const { getRegistrationFrom } = require('./user.view.controller');

// router.get('/signup', getRegistrationFrom);

// router.delete('/update-profile/:id', protect, updateProfile);

module.exports = router;
