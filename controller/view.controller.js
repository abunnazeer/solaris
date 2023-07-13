const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Portfolio = require('../models/portfolio/portfolio.model');
const buyPortfolio = require('../models/portfolio/buyportfolio.model');

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
    const user = req.user;
    //  const user = await User.findOne({ _id: id });

    if (!userProfile || !user) {
      // Handle case when user profile or user is not found
      return res.status(404).json({ message: 'User profile not found' });
    }

    const userWithProfile = {
      _id: user._id,
      fullName: userProfile.fullName,
      profilePicture: userProfile.profilePicture,
      phoneNumber: userProfile.phoneNumber,
      email: user.email,
      street: userProfile.address.street,
      state: userProfile.address.state,
      city: userProfile.address.city,
      zip: userProfile.address.zipCode,
      country: userProfile.address.country,
      role: user.role,
      isActive: user.isActive,
      referralCode: user.referralCode,
    };
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/user/register`;
    res.status(200).render('profile', {
      title: 'Profile',
      userProfile: userWithProfile,
      url,
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

///////////////Get Active Portfolio//////////////////////////////
//////////////////////////////////////
//////////////
const getActivePortfolio = catchAsync(async (req, res) => {
  const userId = req.user.id; // Assuming the user ID is stored in req.user.id
  const buyPortfolios = await buyPortfolio.find({ userId: userId });

  res.status(200).render('portfolio/activeportfolio', {
    title: 'Active Portfolio',
    buyPortfolios,
  });
});

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

  // PORTFOLIO
  getInvestPortfolio,
  getActivePortfolio,
  getInvestHistory,
  getShortTermForm,
  getDetailsPage,

  // REFERRAL VIEW
  getReferral,
  getReferralBunus,

  //Withdrawal
  getWithdrawalRequest,
  getwithdrawalHistory,
  // dashboard,
};
