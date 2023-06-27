const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Portfolio = require('../models/portfolio/portfolio.model');
const buyPortfolio = require('../models/portfolio/buyportfolio.model');

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

// const dashboard = catchAsync(async (req, res) => {
//   const user = req.user.id; // Assuming the authenticated user ID is available in req.user.id
//   const portfolios = await buyPortfolio.find({ userId: user }); // Find all portfolios with matching user ID
//   res.status(200).render('dashboard', { title: 'Dashboard', portfolios });
// });

const dashboard = catchAsync(async (req, res) => {
  const user = req.user.id;
  const portfolios = await buyPortfolio.find({ userId: user });

  // Retrieve the previously stored portfolios from the session (assuming you're using express-session)
  const previousPortfolios = req.session.portfolios || [];

  // Check if there is new data by comparing the current and previous portfolios
  const newData = hasNewData(portfolios, previousPortfolios);

  // Update the session with the current portfolios
  req.session.portfolios = portfolios;

  // Stop incrementing the balance after 20 seconds
  const terminationTime = Date.now() + 20000;
  const intervals = [];

  // Iterate over each portfolio
  for (const portfolio of portfolios) {
    if (portfolio.payout === portfolio.payoutName[portfolio.payout]) {
      const amount = portfolio.amount;
      let balance = portfolio.balance;

      // const interval = portfolio.portConfig[portfolio.payout];
      const interval = portfolio.portConfig[portfolio.payout];
      intervals.push(interval); // Store the interval

      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime >= terminationTime) {
          clearInterval(intervalId);
          return;
        }
        // console.log(interval);
        const newBalance = balance + 0.04 * amount;
        buyPortfolio
          .findByIdAndUpdate(
            portfolio._id,
            { balance: newBalance },
            { new: true }
          )
          .then(updatedPortfolio => {
            // Update the portfolio in the array of portfolios
            const index = portfolios.findIndex(
              p => p._id === updatedPortfolio._id
            );
            portfolios[index] = updatedPortfolio;
          })
          .catch(err => {
            console.error(err);
            return res
              .status(500)
              .send('An error occurred while updating the portfolio.');
          });

        balance = newBalance;
      }, interval);
    }
  }

  // Render the response with the initial portfolios and newData flag
  res.status(200).render('dashboard', {
    title: 'Dashboard',
    portfolios,
    newData,
    intervals,
  });
});

// Helper function to check if there is new data
function hasNewData(currentPortfolios, previousPortfolios) {
  if (currentPortfolios.length !== previousPortfolios.length) {
    return true;
  }

  // Compare each portfolio to check for differences
  for (let i = 0; i < currentPortfolios.length; i++) {
    if (currentPortfolios[i].balance !== previousPortfolios[i].balance) {
      return true;
    }
    // Perform additional checks for other fields if necessary
  }

  return false;
}

// const dashboard = catchAsync(async (req, res) => {
//   const user = req.user.id;
//   const portfolios = await buyPortfolio.find({ userId: user });

//   // Stop incrementing the balance after 20 seconds
//   const terminationTime = Date.now() + 20000;

//   // Iterate over each portfolio
//   for (const portfolio of portfolios) {
//     if (portfolio.payout === portfolio.payoutName[portfolio.payout]) {
//       const amount = portfolio.amount;
//       let balance = portfolio.balance;

//       const interval = portfolio.portConfig[portfolio.payout];

//       const intervalId = setInterval(() => {
//         const currentTime = Date.now();
//         if (currentTime >= terminationTime) {
//           clearInterval(intervalId);
//           return;
//         }

//         const newBalance = balance + 0.04 * amount;
//         buyPortfolio
//           .findByIdAndUpdate(
//             portfolio._id,
//             { balance: newBalance },
//             { new: true }
//           )
//           .then(updatedPortfolio => {
//             // Update the portfolio in the array of portfolios
//             const index = portfolios.findIndex(
//               p => p._id === updatedPortfolio._id
//             );
//             portfolios[index] = updatedPortfolio;
//           })
//           .catch(err => {
//             console.error(err);
//             return res
//               .status(500)
//               .send('An error occurred while updating the portfolio.');
//           });

//         balance = newBalance;
//       }, interval);
//     }
//   }

//   // Render the response with the initial portfolios
//   res.status(200).render('dashboard', { title: 'Dashboard', portfolios });
// });

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
    };
    res.status(200).render('profile', {
      title: 'Profile',
      userProfile: userWithProfile,
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

  // Activity
  getActivity,
  getTransfer,
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
  dashboard,
};
