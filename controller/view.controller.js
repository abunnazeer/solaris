const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Portfolio = require('../models/portfolio/portfolio.model');
const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 9500 });
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

// Create an empty array to store connected WebSocket clients
const clients = [];

// WebSocket connection handler
wss.on('connection', ws => {
  // Add the connected client to the array
  clients.push(ws);

  // Remove the client from the array when the connection is closed
  ws.on('close', () => {
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

//Function to send balance updates to all connected clients
function sendBalanceUpdate(portfolioId, balance, compBalance) {
  const message = JSON.stringify({ portfolioId, balance, compBalance });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
/// Dashboaed

// const dashboard = async (req, res) => {
//   try {
//     const user = req.user.id; // Get the user ID from the request object
//     const portfolios = await buyPortfolio.find({ userId: user }); // Find portfolios associated with the user

//     // Iterate over each portfolio
//     for (const portfolio of portfolios) {
//       // Check if the portfolio has specific conditions for daily payout
//       if (
//         portfolio.payout === portfolio.payoutName[portfolio.payout] && // Check if payout type matches the payout name
//         portfolio.payout !== 'annually' && // Check if payout is not 'annually'
//         portfolios.status === 'active' // Check if portfolio status is 'active'
//       ) {
//         const amount = portfolio.amount; // Get the portfolio amount
//         let balance = portfolio.balance; // Get the current balance of the portfolio

//         const interval = portfolio.portConfig[portfolio.payout]; // Get the interval for the payout

//         let currentTime = new Date(portfolio.dateOfPurchase).getTime(); // Get the timestamp of the portfolio's date of purchase
//         const terminationTime = new Date(portfolio.dateOfExpiry).getTime(); // Get the timestamp of the portfolio's date of expiry

//         const dailyInterval = interval / 7; // Calculate the daily interval by dividing the weekly interval by 7

//         // Set up an interval that runs daily
//         const intervalId = setInterval(async () => {
//           if (currentTime >= terminationTime) {
//             // If the current time exceeds the termination time, clear the interval and return
//             clearInterval(intervalId);
//             return;
//           }

//           const newBalance = balance + 0.04 * amount; // Calculate the new balance with 4% interest
//           const updatedPortfolio = await buyPortfolio.findByIdAndUpdate(
//             portfolio._id, // Find the portfolio by its ID
//             { balance: newBalance }, // Update the balance with the new balance
//             { new: true } // Return the updated portfolio after the update
//           );

//           const index = portfolios.findIndex(
//             p => p._id === updatedPortfolio._id
//           ); // Find the index of the updated portfolio in the portfolios array
//           portfolios[index] = updatedPortfolio; // Replace the old portfolio with the updated portfolio

//           sendBalanceUpdate(
//             updatedPortfolio._id,
//             updatedPortfolio.balance,
//             updatedPortfolio.compBalance
//           ); // Call a function to send balance update notification

//           balance = newBalance; // Update the balance variable with the new balance
//         }, dailyInterval);
//       }

//       // Check if the portfolio has specific conditions for compounding payout
//       if (
//         portfolio.payout === portfolio.payoutName['annually'] && // Check if payout type is 'annually'
//         portfolio.payout !== 'weekly' && // Check if payout is not 'weekly'
//         portfolios.status === 'active' // Check if portfolio status is 'active'
//       ) {
//         const amount = portfolio.amount; // Get the portfolio amount
//         let compBalance = portfolio.compBalance; // Get the current compounded balance of the portfolio

//         const interval = portfolio.portConfig[portfolio.payout]; // Get the interval for the payout

//         let currentTime = new Date(portfolio.dateOfPurchase).getTime(); // Get the timestamp of the portfolio's date of purchase
//         const terminationTime = new Date(portfolio.dateOfExpiry).getTime(); // Get the timestamp of the portfolio's date of expiry

//         const dailyInterval = interval / 7; // Calculate the daily interval by dividing the weekly interval by 7

//         // Set up an interval that runs daily
//         const intervalId = setInterval(async () => {
//           if (currentTime >= terminationTime) {
//             // If the current time exceeds the termination time, clear the interval and return
//             clearInterval(intervalId);
//             return;
//           }

//           const newCompBalance = compBalance + 0.04 * amount; // Calculate the new compounded balance with 4% interest
//           const updatedPortfolios = await buyPortfolio.findByIdAndUpdate(
//             portfolio._id, // Find the portfolio by its ID
//             {
//               compBalance: newCompBalance, // Update the compounded balance with the new compounded balance
//               compAmount: newCompBalance + amount, // Update the compounded amount with the new compounded balance plus the original amount
//             },
//             { new: true } // Return the updated portfolio after the update
//           );

//           const index = portfolios.findIndex(
//             p => p._id === updatedPortfolios._id
//           ); // Find the index of the updated portfolio in the portfolios array
//           portfolios[index] = updatedPortfolios; // Replace the old portfolio with the updated portfolio

//           sendBalanceUpdate(
//             updatedPortfolios._id,
//             updatedPortfolios.balance,
//             updatedPortfolios.compBalance
//           ); // Call a function to send balance update notification

//           compBalance = newCompBalance; // Update the compBalance variable with the new compounded balance

//           currentTime += 24 * 60 * 60 * 1000; // Increment currentTime by 1 day (24 hours) in milliseconds
//         }, dailyInterval);
//       }
//     }

//     res.status(200).render('dashboard', {
//       title: 'Dashboard',
//       portfolios,
//     }); // Render the dashboard view with the portfolios data
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('An error occurred while fetching the portfolios.');
//   }
// };
// const dashboard = async (req, res) => {
//   try {
//     const user = req.user.id; // Get the user ID from the request object
//     const portfolios = await buyPortfolio.find({ userId: user }); // Find portfolios associated with the user

//     // Iterate over each portfolio
//     for (const portfolio of portfolios) {
//       // Check if the portfolio has specific conditions for weekly payout
//       if (
//         portfolio.payout === portfolio.payoutName[portfolio.payout] && // Check if payout type matches the payout name
//         portfolio.payout !== 'compounding' && // Check if payout is not 'annually'
//         portfolio.status === 'active' // Check if portfolio status is 'active'
//       ) {
//         const amount = portfolio.amount; // Get the portfolio amount
//         let balance = portfolio.balance; // Get the current balance of the portfolio
//         const dailyPercentage = portfolio.dailyPercentage; // Get the current balance of the portfolio

//         const interval = portfolio.portConfig[portfolio.payout]; // Get the interval for the payout (12 months in milliseconds)
//         // this is the starting date and time 2023-07-02T19:14:56.661+00:00
//         let currentTime = new Date(portfolio.dateOfPurchase).getTime(); // Get the timestamp of the portfolio's date of purchase
//         // this is the ending date time 2024-07-02T19:14:56.661+00:00
//         const terminationTime = new Date(portfolio.dateOfExpiry).getTime(); // Get the timestamp of the portfolio's date of expiry

//         const dailyInterval = interval; /// 52; // Calculate the weekly interval by dividing the 12-month interval by 52 weeks

//         // Set up an interval that runs weekly
//         const intervalId = setInterval(async () => {
//           if (portfolio.status === 'inactive') {
//             // If the portfolio status is 'inactive', clear the interval and return
//             clearInterval(intervalId);
//             return;
//           }

//           if (currentTime >= terminationTime) {
//             // If the current time exceeds the termination time, clear the interval and update the portfolio status
//             clearInterval(intervalId);
//             await buyPortfolio.findByIdAndUpdate(portfolio._id, {
//               status: 'inactive',
//             });
//             return;
//           }

//           const newBalance = balance + dailyPercentage * amount; // Calculate the new balance with 4% interest
//           // const newBalance = balance + 0.04 * amount; // Calculate the new balance with 4% interest
//           const updatedPortfolio = await buyPortfolio.findByIdAndUpdate(
//             portfolio._id, // Find the portfolio by its ID
//             { balance: newBalance }, // Update the balance with the new balance
//             { new: true } // Return the updated portfolio after the update
//           );

//           const index = portfolios.findIndex(
//             p => p._id === updatedPortfolio._id
//           ); // Find the index of the updated portfolio in the portfolios array
//           portfolios[index] = updatedPortfolio; // Replace the old portfolio with the updated portfolio

//           sendBalanceUpdate(
//             updatedPortfolio._id,
//             updatedPortfolio.balance,
//             updatedPortfolio.compBalance
//           ); // Call a function to send balance update notification

//           balance = newBalance; // Update the balance variable with the new balance
//           currentTime += 24 * 60 * 60 * 1000; // Increment currentTime by 1 day in milliseconds
//         }, dailyInterval);
//       }

//       // Check if the portfolio has specific conditions for compounding payout
//       if (
//         portfolio.payout === portfolio.payoutName['compounding'] && // Check if payout type is 'annually'
//         portfolio.payout !== 'daily' && // Check if payout is not 'weekly'
//         portfolio.status === 'active' // Check if portfolio status is 'active'
//       ) {
//         const amount = portfolio.amount; // Get the portfolio amount
//         let compBalance = portfolio.compBalance; // Get the current compounded balance of the portfolio
//         const compPercentage = portfolio.compPercentage; // Get the current balance of the portfolio

//         const interval = portfolio.portConfig[portfolio.payout]; // Get the interval for the payout (12 months in milliseconds)

//         let currentTime = new Date(portfolio.dateOfPurchase).getTime(); // Get the timestamp of the portfolio's date of purchase
//         const terminationTime = new Date(portfolio.dateOfExpiry).getTime(); // Get the timestamp of the portfolio's date of expiry

//         const dailyInterval = interval; // Calculate the weekly interval by dividing the 12-month interval by 52 weeks

//         const intervalId = setInterval(async () => {
//           if (portfolio.status === 'inactive') {
//             // If the portfolio status is 'inactive', clear the interval and return
//             clearInterval(intervalId);
//             return;
//           }

//           if (currentTime >= terminationTime) {
//             // If the current time exceeds the termination time, clear the interval and update the portfolio status
//             clearInterval(intervalId);
//             await buyPortfolio.findByIdAndUpdate(portfolio._id, {
//               status: 'inactive',
//             });
//             return;
//           }

//           const newCompBalance = compBalance + compPercentage * amount;
//           const updatedPortfolios = await buyPortfolio.findByIdAndUpdate(
//             portfolio._id,
//             {
//               compBalance: newCompBalance,
//               compAmount: newCompBalance + amount,
//             },
//             { new: true }
//           );

//           const index = portfolios.findIndex(
//             p => p._id === updatedPortfolios._id
//           );
//           portfolios[index] = updatedPortfolios;

//           sendBalanceUpdate(
//             updatedPortfolios._id,
//             updatedPortfolios.balance,
//             updatedPortfolios.compBalance
//           );

//           compBalance = newCompBalance;

//           currentTime += 24 * 60 * 60 * 1000;
//         }, dailyInterval);
//       }
//     }

//     res.status(200).render('dashboard', {
//       title: 'Dashboard',
//       portfolios,
//     }); // Render the dashboard view with the portfolios data
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('An error occurred while fetching the portfolios.');
//   }
// };

const dashboard = async (req, res) => {
  try {
    const user = req.user.id; // Get the user ID from the request object
    const portfolios = await buyPortfolio.find({ userId: user }); // Find portfolios associated with the user

    // Iterate over each portfolio
    for (const portfolio of portfolios) {
      // Check if the portfolio has specific conditions for weekly payout
      if (
        portfolio.payout === portfolio.payoutName[portfolio.payout] && // Check if payout type matches the payout name
        portfolio.payout !== 'compounding' && // Check if payout is not 'annually'
        portfolio.status === 'active' // Check if portfolio status is 'active'
      ) {
        const amount = portfolio.amount; // Get the portfolio amount
        let balance = portfolio.balance; // Get the current balance of the portfolio
        const dailyPercentage = portfolio.dailyPercentage; // Get the current balance of the portfolio

        const interval = portfolio.portConfig[portfolio.payout]; // Get the interval for the payout (12 months in milliseconds)
        // this is the starting date and time 2023-07-02T19:14:56.661+00:00

        let currentTime = Date.parse(portfolio.dateOfPurchase); // Get the timestamp of the portfolio's date of purchase
        // let currentTime = new Date(portfolio.dateOfPurchase).getTime(); // Get the timestamp of the portfolio's date of purchase
        // this is the ending date time 2024-07-02T19:14:56.661+00:00
        const terminationTime = Date.parse(portfolio.dateOfExpiry); // Get the timestamp of the portfolio's date of expiry
        // const terminationTime = new Date(portfolio.dateOfExpiry).getTime(); // Get the timestamp of the portfolio's date of expiry

        // Calculate the number of milliseconds in a day
        const millisecondsInDay = 24 * 60 * 60 * 1000;

        // Calculate the number of days between the starting and ending dates
        const totalDays = Math.ceil(
          (terminationTime - currentTime) / millisecondsInDay
        );

        // Calculate the daily interval for the payout
        const dailyInterval = interval / totalDays;
        console.log('Interval:', interval);
        console.log('Termination Time:', terminationTime);
        console.log('Total Days:', totalDays);
        console.log('Daily Interval:', dailyInterval);
        console.log('current time', currentTime);

        // Set up an interval that runs daily
        const intervalId = setInterval(async () => {
          if (portfolio.status === 'inactive') {
            // If the portfolio status is 'inactive', clear the interval and return
            clearInterval(intervalId);
            return;
          }

          if (currentTime >= terminationTime) {
            // If the current time exceeds the termination time, clear the interval and update the portfolio status
            clearInterval(intervalId);
            await buyPortfolio.findByIdAndUpdate(portfolio._id, {
              status: 'inactive',
            });
            return;
          }

          const newBalance = balance + dailyPercentage * amount; // Calculate the new balance with 4% interest

          const updatedPortfolio = await buyPortfolio.findByIdAndUpdate(
            portfolio._id, // Find the portfolio by its ID
            { balance: newBalance }, // Update the balance with the new balance
            { new: true } // Return the updated portfolio after the update
          );

          const index = portfolios.findIndex(
            p => p._id === updatedPortfolio._id
          ); // Find the index of the updated portfolio in the portfolios array
          portfolios[index] = updatedPortfolio; // Replace the old portfolio with the updated portfolio

          sendBalanceUpdate(
            updatedPortfolio._id,
            updatedPortfolio.balance,
            updatedPortfolio.compBalance
          ); // Call a function to send balance update notification

          balance = newBalance; // Update the balance variable with the new balance
          currentTime += millisecondsInDay; // Increment currentTime by 1 day in milliseconds
        }, dailyInterval);
      }

      // Check if the portfolio has specific conditions for compounding payout
      if (
        portfolio.payout === portfolio.payoutName['compounding'] && // Check if payout type is 'annually'
        portfolio.payout !== 'daily' && // Check if payout is not 'weekly'
        portfolio.status === 'active' // Check if portfolio status is 'active'
      ) {
        const amount = portfolio.amount; // Get the portfolio amount
        let compBalance = portfolio.compBalance; // Get the current compounded balance of the portfolio
        const compPercentage = portfolio.compPercentage; // Get the current balance of the portfolio

        const interval = portfolio.portConfig[portfolio.payout]; // Get the interval for the payout (12 months in milliseconds)

        let currentTime = Date.parse(portfolio.dateOfPurchase); // Get the timestamp of the portfolio's date of purchase
        const terminationTime = Date.parse(portfolio.dateOfExpiry); // Get the timestamp of the portfolio's date of expiry

        // Calculate the number of milliseconds in a day
        const millisecondsInDay = 24 * 60 * 60 * 1000;

        // Calculate the number of days between the starting and ending dates
        const totalDays = Math.ceil(
          (terminationTime - currentTime) / millisecondsInDay
        );

        // Calculate the daily interval for the payout
        const dailyInterval = interval / totalDays;

        const intervalId = setInterval(async () => {
          if (portfolio.status === 'inactive') {
            // If the portfolio status is 'inactive', clear the interval and return
            clearInterval(intervalId);
            return;
          }

          if (currentTime >= terminationTime) {
            // If the current time exceeds the termination time, clear the interval and update the portfolio status
            clearInterval(intervalId);
            await buyPortfolio.findByIdAndUpdate(portfolio._id, {
              status: 'inactive',
            });
            return;
          }

          const newCompBalance = compBalance + compPercentage * amount;

          const updatedPortfolios = await buyPortfolio.findByIdAndUpdate(
            portfolio._id,
            {
              compBalance: newCompBalance,
              compAmount: newCompBalance + amount,
            },
            { new: true }
          );

          const index = portfolios.findIndex(
            p => p._id === updatedPortfolios._id
          );
          portfolios[index] = updatedPortfolios;

          sendBalanceUpdate(
            updatedPortfolios._id,
            updatedPortfolios.balance,
            updatedPortfolios.compBalance
          );

          compBalance = newCompBalance;

          currentTime += millisecondsInDay;
        }, dailyInterval);
      }
    }

    res.status(200).render('dashboard', {
      title: 'Dashboard',
      portfolios,
    }); // Render the dashboard view with the portfolios data
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the portfolios.');
  }
};

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
