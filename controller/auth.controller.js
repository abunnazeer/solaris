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
const { profile } = require('console');

// function for jwt
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
  // this remove the password from output
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
const register = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  // create user profile while creating user
  const newProfile = await Profile.create({
    //assigning user id to profle id
    _id: newUser._id,
    fullName: req.body.fullName,
    role: newUser.role,
  });
  // const token = signToken(newUser._id);
  createSendToken(newUser, newProfile, 201, res);
});

// Login endpoint
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password are in the db
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }
  // Check to see if email and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // if everything is ok, send token to client

  // const token = signToken(user._id);
  createSendToken(user._id, null, 201, res);
  // res.status(200).json({
  //   status: 'success',
  //   message: 'Your successfully logged in',
  //   // status: ' Your successfully logged in',
  //   token,
  // });
});

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: ' Your successfully logged out',
  });
};

// Role-based authorization endpoint
const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not login please login to get access', 401)
    );
  }
  // verifying the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check to see if user exitst

  const existingUser = await User.findById(decoded.id);
  if (!existingUser) {
    return next(
      new AppError('The user beloging  to this user does no longer exist.', 401)
    );
  }
  if (existingUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User rencently changed password! please log in again.', 401)
    );
  }
  req.user = existingUser;
  next();
});

// Middleware to check if user is logged in
const isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // Verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // Find the user associated with the decoded token
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      // If user not found, proceed to next middleware
      return next();
    }

    // Check if the user exists in the database
    const existingUser = await User.findById(decoded.id);

    if (!existingUser) {
      // If user not found, proceed to next middleware
      return next();
    }

    // Check if user changed password after the token was issued
    if (existingUser.changedPasswordAfter(decoded.iat)) {
      // If password changed, proceed to next middleware
      return next();
    }

    // Set the logged in user in res.locals
    res.locals.user = existingUser;

    // Proceed to next middleware
    return next();
  }

  // No token found, proceed to next middleware
  next();
});

const restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('You dont have permision to to perform this action', 403)
      );
    }
    next();
  };
};
const forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a Update request with a new password and passwordConfirm to reset ${resetUrl}.\nif you didn't forget your password please ignore this mail`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password Reset token(valid for min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('there an error sending email', 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or it has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: ' Your successfully logged in',
    token,
  });
});

module.exports = {
  register,
  login,
  protect,
  resetPassword,
  forgetPassword,
  restrictTo,
  isLoggedIn,
  logout,
};

// // const express = require('express');
// const { promisify } = require('util');
// const crypto = require('crypto');
// // const nodemailer = require('nodemailer');

// // const router = express.Router();
// const jwt = require('jsonwebtoken');
// const User = require('../models/user/user.model');
// const Profile = require('../models/user/profile.model');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
// const sendEmail = require('../utils/email');
// const { profile } = require('console');
// // const { profile } = require('console');

// // function for jwt
// const signToken = id => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// const createSendToken = async (user, profile, statusCode, res) => {
//   const token = signToken(user._id);
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 1000
//     ),
//     httpOnly: true,
//   };
//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
//   res.cookie('jwt', token, cookieOptions);
//   // this removes the password from the output
//   user.password = undefined;

//   if (user.isActive) {
//     // Send activation email to the user
//     const activationToken = signToken(user._id);
//     const activationUrl = `${req.protocol}://${req.get(
//       'host'
//     )}/activate-account/${activationToken}`;

//     const activationMessage = `Welcome to our platform! Please click the following link to activate your account: ${activationUrl}`;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: 'Account Activation',
//         message: activationMessage,
//       });
//     } catch (err) {
//       // Handle error if unable to send activation email
//       console.error('Error sending activation email:', err);
//     }
//   }

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//       profile,
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
//     isActive: false, // Set isActive flag to false initially
//   });
//   // create user profile while creating user
//   const newProfile = await Profile.create({
//     // assigning user id to profile id
//     _id: newUser._id,
//     fullName: req.body.fullName,
//     role: newUser.role,
//   });
//   // const token = signToken(newUser._id);
//   createSendToken(newUser, newProfile, 201, res);
// });
// // User Activation
// const activateAccount = catchAsync(async (req, res, next) => {
//   const { token } = req.params;

//   // Verify the activation token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   const user = await User.findById(decoded.id);
//   if (!user) {
//     return next(new AppError('User not found', 404));
//   }

//   // Activate the user account
//   user.isActive = true;
//   await user.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'Account activated successfully',
//   });
// });

// // Login endpoint
// const login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;
//   // Check if email and password are in the db
//   if (!email || !password) {
//     return next(new AppError('Please provide email and password'));
//   }
//   // Check to see if email and password are correct
//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   if (!user.isActive) {
//     return next(new AppError('Your account is not yet activated', 401));
//   }

//   // if everything is ok, send token to client
//   createSendToken(user, null, 201, res);
// });

// // Role-based authorization endpoint
// const protect = catchAsync(async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return next(
//       new AppError('You are not logged in. Please login to get access', 401)
//     );
//   }
//   // verifying the token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   // check to see if user exists

//   const existingUser = await User.findById(decoded.id);
//   if (!existingUser) {
//     return next(
//       new AppError('The user belonging to this token does not exist.', 401)
//     );
//   }
//   if (existingUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('User recently changed password! Please log in again.', 401)
//     );
//   }
//   req.user = existingUser;
//   next();
// });

// const isLoggedIn = catchAsync(async (req, res, next) => {
//   if (req.cookies.jwt) {
//     // verify token
//     const decoded = await promisify(jwt.verify)(
//       req.cookies.jwt,
//       process.env.JWT_SECRET
//     );
//     //
//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next();
//     }

//     // check to see if user exists

//     const existingUser = await User.findById(decoded.id);
//     if (!existingUser) {
//       return next();
//     }

//     // check if user changed password after the token was issued
//     if (existingUser.changedPasswordAfter(decoded.iat)) {
//       return next();
//     }
//     // Login user
//     // res.local.user = existingUser;

//     next();
//   }
//   next();
// });

// const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action', 403)
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

//   const message = `Forgot your password? Submit an update request with a new password and passwordConfirm to reset ${resetUrl}.\nIf you didn't forget your password, please ignore this email`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Your password Reset token (valid for 10 min)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email!',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(new AppError('There was an error sending the email', 500));
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
//     return next(new AppError('Token is invalid or has expired', 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   const token = signToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     message: 'You have successfully logged in',
//     token,
//   });
// });

// module.exports = {
//   register,
//   login,
//   protect,
//   resetPassword,
//   forgetPassword,
//   restrictTo,
//   isLoggedIn,
//   activateAccount,
// };
