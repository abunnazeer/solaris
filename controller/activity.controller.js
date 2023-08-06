const AppError = require('../utils/appError');

// ACTIVITIES VIEW CONTROLLER

const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const Transactions = require('../models/portfolio/transaction.model');
const TwoFactor = require('../models/user/twoFactor.model');

const getActivity = async (req, res, next) => {
  const { id, role } = req.user;
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of activities per page

    let count, activities;

    if (role === 'admin') {
      count = await Transactions.countDocuments(); // Total count of all activities
      activities = await Transactions.find({})
        .populate('buyPortfolioId')
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      count = await Transactions.countDocuments({ userId: id }); // Total count of activities for the logged-in user
      activities = await Transactions.find({ userId: id })
        .populate('buyPortfolioId')
        .skip((page - 1) * limit)
        .limit(limit);
    }

    const buyPortfolioId = activities.buyPortfolioId;
    let payout = 'No value';

    if (buyPortfolioId) {
      const buyPortfolio = await buyPortfolio.findOne({
        _id: buyPortfolioId,
        userId: id,
      });
      if (buyPortfolio) {
        payout = buyPortfolio.payout;
      }
    }

    let twoFactorCode = null;
    if (id) {
      twoFactorCode = await TwoFactor.findOne({ user: id });
    }

    if (twoFactorCode) {
      console.log(twoFactorCode.userId);
    }

    res.status(200).render('activities/activity', {
      title: 'Transaction History',
      payout: payout,
      activities: activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit: limit,
    });
  } catch (err) {
    console.log(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};
const postWithdrawal = async (req, res) => {
  console.log('Processing withdrawal request for user:', req.user.id); // Log the start of the process

  const { id } = req.user;
  const { amount, walletAddress, authCode, method } = req.body;

  // Validate input data
  if (!amount || !walletAddress || !authCode || !method) {
    return res.status(400).send('Missing required information.');
  }

  // Find the two-factor authentication code for the logged-in user
  const authRecord = await TwoFactor.findOne({
    userId: id,
  });

  //Check if the auth code exists and if the user ID matches
  if (!authRecord || authRecord.userId.toString() !== id.toString()) {
    return res.status(400).send('Invalid user or authentication record.');
  }

  // Check if the auth code is empty
  if (!authRecord.code) {
    console.log('Authentication code is empty.'); // Log empty authentication code
    return res.status(400).send('Authentication code is empty.');
  }

  // Compare the authCode from the form with the stored code
  if (Number(authCode) !== Number(authRecord.code)) {
    return res.status(400).send('Invalid authentication code.');
  }

  try {
    // Generate a serial number
    function generateRandomNumber() {
      const min = 10000;
      const max = 99999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Get the current date
    const date = new Date();

    // Find the buy portfolio
    const portfolioBuy = await buyPortfolio.findOne({
      payout: 'Daily Payout',
      balance: { $ne: 0 },
      userId: id,
    });

    // Check for sufficient balance
    if (portfolioBuy && portfolioBuy.balance < amount) {
      return res.status(400).send('Insufficient balance.');
    }

    let buyPortfolioId = portfolioBuy ? portfolioBuy._id : null;

    // Subtract `amount` from `buyPortfolio.balance`
    if (buyPortfolioId) {
      await buyPortfolio.updateOne(
        { _id: buyPortfolioId },
        { $inc: { balance: -amount } }
      );
    }

    // Create a new TransactionsActivity document
    const transActivity = new Transactions({
      sn: generateRandomNumber(),
      date: date,
      description: 'Withdrawal',
      buyPortfolioId: buyPortfolioId,
      status: buyPortfolioId ? 'Pending Approval' : 'Approved',
      amount: amount,
      authCode: authCode,
      walletAddress: walletAddress,
      method: method,
      userId: id,
    });

    // Save the TransactionsActivity document
    await transActivity.save();
    // Delete the TwoFactor authentication record
    await TwoFactor.deleteOne({ userId: id });

    res.status(200).json({
      message: 'Withdrawal successfully processed.',
      redirectUrl: '/user/withdrawal-status',
    });
  } catch (err) {
    console.error('An error occurred while processing the withdrawal:', err); // Log the error with details
    res.status(500).send('An error occurred while processing the withdrawal.');
  }
};

const getTransfer = (req, res) => {
  res.status(200).render('activities/transfer', {
    title: 'Transfer',
  });
};

const getwithdrawalStatus = (req, res) => {
  res.status(200).render('response/status', {
    message: 'Withdrawal successfully processed.',
  });
};

const getWithdrawalRequest = async (req, res, next) => {
  const { id, role } = req.user; // Get the user ID and role from req.user

  try {
    // const page = parseInt(req.query.page) || 1; // Current page number
    // const limit = parseInt(req.query.limit) || 10; // Number of activities per page

    // let conditions = {}; // Initialize an empty object for the query conditions

    // // Check if the user role is 'admin'
    // if (role === 'admin') {
    //   // No specific conditions needed for admin, so leave conditions object empty
    // } else if (role === 'personal') {
    //   // Set the condition to match the user ID for 'personal' role
    //   conditions = { userId: id };
    // }
    const portfolioBuy = await buyPortfolio.findOne({
      userId: id,
    });
    // // console.log(conditions);
    // const count = await Transactions.countDocuments(conditions); // Total count of activities based on conditions
    // const totalPages = Math.ceil(count / limit); // Calculate total number of pages

    // // console.log(count);
    // const skip = (page - 1) * limit; // Calculate number of activities to skip

    // const activities = await Transactions.find(conditions)
    //   .populate({
    //     path: 'userId',
    //     model: 'User',
    //     select: 'name email', // Specify the fields you want to retrieve from the User model
    //   })
    //   .populate('buyPortfolioId')
    //   .skip(skip)
    //   .limit(limit);

    // let twoFactorCode = null;
    // if (id) {
    //   twoFactorCode = await TwoFactor.findOne({ user: id });
    // }

    // if (twoFactorCode) {
    //   // console.log(twoFactorCode.userId);
    // }

    res.status(200).render('withdrawal/withdrawalrequest', {
      title: 'Withdrawal Request',
      // activities: activities,
      // totalPages: totalPages,
      portfolioBuy,
      // currentPage: page,
      // limit: limit, // Pass the 'limit' value to the template
    });
  } catch (err) {
    console.log(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};

const getwithdrawalHistory = async (req, res, next) => {
  const { id, role } = req.user; // Get the user ID and role from req.user

  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of activities per page

    let conditions = {}; // Initialize an empty object for the query conditions

    // Check if the user role is 'admin'
    if (role === 'admin') {
      // No specific conditions needed for admin, so leave conditions object empty
    } else if (role === 'personal') {
      // Set the condition to match the user ID for 'personal' role
      conditions = { userId: id };
    }
    // console.log(conditions);
    const count = await Transactions.countDocuments(conditions); // Total count of activities based on conditions
    const totalPages = Math.ceil(count / limit); // Calculate total number of pages

    // console.log(count);
    const skip = (page - 1) * limit; // Calculate number of activities to skip

    const activities = await Transactions.find(conditions)
      .populate({
        path: 'userId',
        model: 'User',
        select: 'name email', // Specify the fields you want to retrieve from the User model
      })
      .populate('buyPortfolioId')
      .skip(skip)
      .limit(limit);

    let twoFactorCode = null;
    if (id) {
      twoFactorCode = await TwoFactor.findOne({ user: id });
    }

    if (twoFactorCode) {
      // console.log(twoFactorCode.userId);
    }

    res.status(200).render('withdrawal/withdrawalhistory', {
      title: 'Withdrawal History',
      activities: activities,
      totalPages: totalPages,
      currentPage: page,
      limit: limit, // Pass the 'limit' value to the template
    });
  } catch (err) {
    console.log(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};

module.exports = {
  getActivity,
  getTransfer,
  postWithdrawal,
  getWithdrawalRequest,
  getwithdrawalHistory,
  getwithdrawalStatus,
};
