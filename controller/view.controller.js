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

const getBizForm = (req, res) => {
  res.status(200).render('bizregister', {
    title: 'Business Registration',
  });
};
const getProfile = (req, res) => {
  res.status(200).render('profile', {
    title: 'Profile',
  });
};

const getActivation = (req, res) => {
  res.status(200).render('activation', {
    title: 'Activation',
  });
};
module.exports = {
  getRegistrationForm,
  getLoginForm,
  getForgetPasswordForm,
  getProfile,
  getBizForm,
  getResetPasswordForm,
  getActivation,
};
