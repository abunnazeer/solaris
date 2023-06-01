// const express = require('express');
const { promisify } = require('util');
const crypto = require('crypto');

// const nodemailer = require('nodemailer');

// const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

// // function for jwt
// const signToken = id => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// const createSendToken = (user, statusCode, res) => {
//   const token = signToken(user._id);
//   res.cookies('jwt', token, {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 1000
//     ),
//     secure: true,
//     httpOnly: true,
//   });
//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//     },
//   });
// };
// // Registration endpoint
// const register = catchAsync(async (req, res, next) => {
//   const newUser = await User.create({
//     email: req.body.email,
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//     role: req.body.role,
//   });
//   // create user profile while creating user
//   const newProfile = await Profile.create({
//     //assigning user id to profle id
//     _id: newUser._id,
//     fullName: req.body.fullName,
//     role: newUser.role,
//   });
//   const token = signToken(newUser._id);
//   res.status(201).json({
//     status: 'success',
//     message: 'User created successfully',
//     token,
//     data: {
//       user: newUser,
//       profile: newProfile,
//     },
//   });
// });

// // Login endpoint
// const login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;
//   // Check if email and password are in the db
//   if (!email || !password) {
//     return next(new AppError('Please provide email and password'));
//   }
//   // Check to see if email and password is correct
//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   // if everything is ok, send token to client

//   const token = signToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     message: 'Your successfully logged in',
//     // status: ' Your successfully logged in',
//     token,
//   });
// });

// // Role-based authorization endpoint
// const protect = catchAsync(async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   if (!token) {
//     return next(
//       new AppError('You are not login please login to get access', 401)
//     );
//   }
//   // verifying the token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   //check to see if user exitst

//   const existingUser = await User.findById(decoded.id);
//   if (!existingUser) {
//     return next(
//       new AppError('The user beloging  to this user does no longer exist.', 401)
//     );
//   }
//   if (existingUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('User rencently changed password! please log in again.', 401)
//     );
//   }
//   req.user = existingUser;
//   next();
// });

// const isLogin = catchAsync(async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   if (!token) {
//     return next(
//       new AppError('You are not login please login to get access', 401)
//     );
//   }
//   // verifying the token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   //check to see if user exitst

//   const existingUser = await User.findById(decoded.id);
//   if (!existingUser) {
//     return next(
//       new AppError('The user beloging  to this user does no longer exist.', 401)
//     );
//   }
//   if (existingUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('User rencently changed password! please log in again.', 401)
//     );
//   }
//   req.user = existingUser;
//   next();
// });

// const restrictTo = (...role) => {
//   return (req, res, next) => {
//     if (!role.includes(req.user.role)) {
//       return next(
//         new AppError('You dont have permision to to perform this action', 403)
//       );
//     }
//     next();
//   };
// };

// const forgetPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError('There is no user with this email', 404));
//   }

//   const resetToken = user.createPasswordResetToken();

//   await user.save({ validateBeforeSave: false });

//   const resetUrl = `${req.protocol}://${req.get(
//     'host'
//   )}/reset-password/${resetToken}`;

//   const message = `Forgot your password? Submit a Update request with a new password and passwordConfirm to reset ${resetUrl}.\nif you didn't forget your password please ignore this mail`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Your password Reset token(valid for min)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'token sent to email!',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(new AppError('there an error sending email', 500));
//   }
// });

// const resetPassword = catchAsync(async (req, res, next) => {
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   if (!user) {
//     return next(new AppError('Token is invalid or it has expired', 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   const token = signToken(user._id);
//   res.status(200).json({
//     status: ' Your successfully logged in',
//     token,
//   });
// });

// getting Register and login form
// const getRegistrationForm = (req, res) => {
//   res.status(200).render('register', {
//     title: 'Registration',
//   });
// };

// const getLoginForm = (req, res) => {
//   res.status(200).render('login', {
//     title: 'Login',
//   });
// };

// const getForgetPasswordForm = (req, res) => {
//   res.status(200).render('forgetpassword', {
//     title: 'Forget Password',
//   });
// };

// const getResetPasswordForm = (req, res) => {
//   res.status(200).render('resetpassword', {
//     title: 'Reset Password',
//   });
// };

// const getBizForm = (req, res) => {
//   res.status(200).render('bizregister', {
//     title: 'Business Registration',
//   });
// };
// const getProfile = (req, res) => {
//   res.status(200).render('profile', {
//     title: 'Profile',
//   });
// };

// const getActivation = (req, res) => {
//   res.status(200).render('activation', {
//     title: 'Activation',
//   });
// };

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  // create erro if user Posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password updates. please use/ updateMypassword',
        400
      )
    );
  }
  // filter out unwanted field names that are allowed to be updated
  const filteredBody = filterObj(req.body, 'fullName', 'email');
  // Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
module.exports = { getMe, updateMe, deleteMe };
