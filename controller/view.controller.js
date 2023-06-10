// const express = require('express');
// const { promisify } = require('util');
// const crypto = require('crypto');

// const jwt = require('jsonwebtoken');
// const User = require('../models/user/user.model');
// const Profile = require('../models/user/profile.model');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
// const sendEmail = require('../utils/email');

const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

// Function for JWT
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, profile, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // This removes the password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
      profile,
    },
  });
};

// Registration endpoint

const getRegistrationForm = (req, res, next) => {
  // const { email, password, passwordConfirm, role } = req.body;

  res.status(201).render('register', {
    title: 'Registration',
  });
  res.redirect('/user/activation');
};

const getBizForm = (req, res, next) => {
  // const { email, password, passwordConfirm, role } = req.body;

  res.status(201).render('bizregister', {
    title: 'Business Registration',
  });
  res.redirect('/user/activation');
};

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

const getForgetPasswordForm = (req, res) => {
  const error = req.query.error; // Retrieve the error message from the query parameters

  res.status(200).render('forgetpassword', {
    title: 'Forget Password',
    error: error,
  });
};

// this Render the reset password form
const getResetPasswordForm = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  res.status(200).render('resetpassword', {
    email: user.email,
  });
});

////////////////////////

const getChangePasswordForm = (req, res) => {
  res.status(200).render('changepassword', {
    title: 'Change Password',
  });
};

const getTwoFactor = (req, res) => {
  res.status(200).render('twofactor', {
    title: 'Two Factor',
  });
};

const getProfile = (req, res) => {
  res.status(200).render('profile', {
    title: 'Profile',
    user: res.locals.user,
  });
};

const getActivation = (req, res) => {
  res.status(200).render('activation', {
    title: 'Activation',
  });
};

const getRegOption = (req, res) => {
  res.status(200).render('regoption', {
    title: 'Registration',
  });
};

// ACTIVITIES VIEW CONTROLLER

const getActivity = (req, res) => {
  res.status(200).render('activities/activity', {
    title: 'Activity',
  });
};

const getTransfer = (req, res) => {
  res.status(200).render('activities/transfer', {
    title: 'Transfer',
  });
};

// INVESTMENT PORTFOLIO

const getInvestPortfolio = (req, res) => {
  res.status(200).render('portfolio/investmentsportfolio', {
    title: 'Investment Portfolio',
  });
};

const getUSerInvest = (req, res) => {
  res
    .status(200)
    .render('portfolio/userinvestment', { title: 'User investment' });
};

const getInvestHistory = (req, res) => {
  res
    .status(200)
    .render('portfolio/investhistory', { title: 'Investment History' });
};

const getDetailsPage = (req, res) => {
  res
    .status(200)
    .render('portfolio/detailspage', { title: 'Portfolio Detail page' });
};

const getShortTermForm = (req, res) => {
  res
    .status(200)
    .render('portfolio/shorttermfunds', { title: 'Short Term Open Funds' });
};

// REFERRAL VIEW
const getReferral = (req, res) => {
  res
    .status(200)
    .render('referrals/referredusers', { title: 'Referred Partners' });
};
const getReferralBunus = (req, res) => {
  res
    .status(200)
    .render('referrals/referralbonus', { title: 'Referral Bunus' });
};

// withdrawal-request
const getWithdrawalRequest = (req, res) => {
  res
    .status(200)
    .render('withdrawal/withdrawalrequest', { title: 'Withdrawal  Request ' });
};

const getwithdrawalHistory = (req, res) => {
  res
    .status(200)
    .render('withdrawal/withdrawalhistory', { title: 'Withdrawal History' });
};

// getting Register and login form
// const getPortfolioForm = (req, res) => {
//   res.status(200).render('portfolioform', {
//     title: 'portfolio',
//   });
// };

module.exports = {
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

  // REFERRAL VIEW
  getReferral,
  getReferralBunus,

  //Withdrawal
  getWithdrawalRequest,
  getwithdrawalHistory,
};
