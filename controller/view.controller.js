// const express = require('express');
// const { promisify } = require('util');
// const crypto = require('crypto');

// const jwt = require('jsonwebtoken');
// const User = require('../models/user/user.model');
// const Profile = require('../models/user/profile.model');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
// const sendEmail = require('../utils/email');

// getting Register and login form
const getRegistrationForm = (req, res) => {
  res.status(200).render('register', {
    title: 'Registration',
  });
};

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

const getForgetPasswordForm = (req, res) => {
  res.status(200).render('forgetpassword', {
    title: 'Forget Password',
  });
};

const getResetPasswordForm = (req, res) => {
  res.status(200).render('resetpassword', {
    title: 'Reset Password',
  });
};

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
const getBizForm = (req, res) => {
  res.status(200).render('bizregister', {
    title: 'Business Registration',
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

  // REFERRAL VIEW
  getReferral,
  getReferralBunus,

  //Withdrawal
  getWithdrawalRequest,
  getwithdrawalHistory,
};
