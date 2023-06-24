const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Portfolio = require('../models/portfolio/portfolio.model');
const byPortfolio = require('../models/portfolio/buyportfolio.model');

// const AppError = require('../utils/appError');

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

// //////////////Dashboard ////////////

// const dashboard = (req, res) => {
//   res.status(200).render('dashboard', { title: 'Dashboard' });
// };

const dashboard = catchAsync(async (req, res) => {
  const user = req.user.id; // Assuming the authenticated user ID is available in req.user.id
  const portfolios = await byPortfolio.find({ userId: user }); // Find all portfolios with matching user ID
  res.status(200).render('dashboard', { title: 'Dashboard', portfolios });
});

module.exports = dashboard;

// Registration endpoint

const getRegistrationForm = (req, res, next) => {
  // const { email, password, passwordConfirm, role } = req.body;

  res.status(201).render('register', {
    title: 'Registration',
  });
  res.redirect('/user/success');
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

// Handler function for default route

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
  res.render('changepassword', {
    title: 'Change Password',
  });
};

const getTwoFactor = (req, res) => {
  res.status(200).render('twofactor', {
    title: 'Two Factor',
  });
};

const getProfile = catchAsync(async (req, res) => {
  try {
    // Retrieve the user profile data from the database or any other source
    const userProfile = await Profile.findOne({ _id: req.user._id });
    const { email } = req.user;

    res.status(200).render('profile', {
      title: 'Profile',
      userProfile,
      email,
    });
  } catch (error) {
    // Handle error if profile retrieval fails
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const getSuccess = (req, res) => {
  res.status(200).render('success', {
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

// //////////// THIS RENDER PORTFOLIO LIST TO BUY//////////

const getInvestPortfolio = catchAsync(async (req, res) => {
  const portfolios = await Portfolio.find();
  const userProfile = await Profile.findOne({ _id: req.user._id });

  const defaultProfile = {
    profilePicture: '../../../images/avatar/avatar-13.png',
    phoneNumber: '0800000000000',
    address: {
      street: 'your street',
      city: 'your city',
      state: 'your state',
      country: 'your country',
      zipCode: 'your zip',
    },
  };

  const isProfileComplete =
    userProfile.profilePicture !== defaultProfile.profilePicture &&
    userProfile.phoneNumber !== defaultProfile.phoneNumber &&
    userProfile.address.street !== defaultProfile.address.street &&
    userProfile.address.city !== defaultProfile.address.city &&
    userProfile.address.state !== defaultProfile.address.state &&
    userProfile.address.country !== defaultProfile.address.country &&
    userProfile.address.zipCode !== defaultProfile.address.zipCode;

  res.status(200).render('portfolio/investmentsportfolio', {
    title: 'buy Portfolio',
    portfolios,
    userProfile,
    isProfileComplete,
  });
});

const getUSerInvest = (req, res) => {
  res
    .status(200)
    .render('portfolio/activeportfolio', { title: 'Active Portfolio' });
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

module.exports = {
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
  dashboard,
};
