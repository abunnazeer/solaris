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
  const { id } = req.user;
  const { amount, walletAddress, authCode, method } = req.body;
  try {
    // 1. Generate a serial number and assign it to `sn`
    function generateRandomNumber() {
      const min = 10000;
      const max = 99999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 2. Get the current date and assign it to `date`
    const date = new Date();

    let buyPortfolioId = null;
    const portfolioBuy = await buyPortfolio.findOne({
      payout: 'daily',
      balance: { $ne: 0 },
      userId: id, // Add this condition to match the user's portfolio
    });
    if (portfolioBuy) {
      buyPortfolioId = portfolioBuy._id;
    }

    // 4. Subtract `amount` from `buyPortfolio.balance`
    if (buyPortfolioId) {
      await buyPortfolio.updateOne(
        { _id: buyPortfolioId },
        { $inc: { balance: -amount } }
      );
    }

    // 5. Create a new TransactionsActivity document
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

    // Redirect to user activity after successful withdrawal
    res.redirect('/user/withdrawal-history');
  } catch (err) {
    console.log(err);
    // Handle error
  }
};

const getTransfer = (req, res) => {
  res.status(200).render('activities/transfer', {
    title: 'Transfer',
  });
};

const getWithdrawalRequest = async (req, res, next) => {
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

    res.status(200).render('withdrawal/withdrawalrequest', {
      title: 'Withdrawal Request',
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
};
