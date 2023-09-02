const AppError = require('../utils/appError');
const axios = require('axios');
const QRCode = require('qrcode');
const sendEmail = require('../utils/email');

// ACTIVITIES VIEW CONTROLLER

const BuyPortfolio = require('../models/portfolio/buyportfolio.model');
const Transactions = require('../models/portfolio/transaction.model');
const TwoFactor = require('../models/user/twoFactor.model');
const ReferralBonus = require('../models/user/referralBonus.model');

const getActivity = async (req, res, next) => {
  const { id, role } = req.user;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filterCriteria = role === 'admin' ? {} : { userId: id };
    // Fetch the total count and activities in parallel
    const [count, activities] = await Promise.all([
      Transactions.countDocuments(filterCriteria),
      Transactions.find(filterCriteria)
        .populate('buyPortfolioId')
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    let payout = 'No value';
    const buyPortfolioId = activities.buyPortfolioId;

    if (buyPortfolioId) {
      const buyPortfolio = await BuyPortfolio.findOne({
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
      payout,
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit,
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

  // Validate input data
  if (!amount || !walletAddress || !authCode || !method) {
    return res.status(400).send('Missing required information.');
  }

  const authRecord = await TwoFactor.findOne({ userId: id });

  if (!authRecord || authRecord.userId.toString() !== id.toString()) {
    return res.status(400).send('Invalid user or authentication record.');
  }

  if (!authRecord.code) {
    return res.status(400).send('Authentication code is empty.');
  }

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

    const date = new Date();
    const portfolioBuy = await BuyPortfolio.findOne({
      payout: 'Daily Payout',
      balance: { $ne: 0 },
      userId: id,
    });
    const portfolios = await BuyPortfolio.find({
      userId: id,
      balance: { $ne: 0 },
    });

    let totalBonus = 0;
    const totalBonusDocs = await ReferralBonus.find({ referringUserId: id });
    totalBonusDocs.forEach(bonusDoc => {
      if (bonusDoc.bonusAmount) {
        totalBonus += parseFloat(bonusDoc.bonusAmount);
      }
    });

    let totalBalance = 0;
    portfolios.forEach(portfolio => {
      totalBalance += portfolio.balance;
    });

    const totalAccountBalance = totalBalance + totalBonus;
    if (totalAccountBalance < amount) {
      return res.status(400).send('Insufficient total account balance.');
    }

    let buyPortfolioId = null;
    let status = 'Pending Approval';
    if (totalBalance >= amount) {
      buyPortfolioId = portfolios[0]._id;
      status = 'Pending Approval';
    }

    const transActivityData = {
      sn: generateRandomNumber(),
      date: date,
      description: 'Withdrawal',
      status: status,
      amount: amount,
      authCode: authCode,
      walletAddress: walletAddress,
      method: method,
      userId: id,
      // Add other necessary fields here
    };

    if (buyPortfolioId !== null) {
      transActivityData.buyPortfolioId = buyPortfolioId;
    }

    const transActivity = new Transactions(transActivityData);
    const savedTransActivity = await transActivity.save({
      validateBeforeSave: false,
    });

    if (!savedTransActivity) {
      return res.status(500).send('Failed to save transaction activity.');
    }

    // Perform subtractions only after successfully saving the transaction
    let deductions = [];
    if (totalBalance >= amount) {
      for (const portfolio of portfolios) {
        const deduction = (portfolio.balance / totalBalance) * amount;
        deductions.push(
          BuyPortfolio.updateOne(
            { _id: portfolio._id },
            { $inc: { balance: -deduction } }
          )
        );
      }
    } else if (totalBonus >= amount) {
      for (const bonusDoc of totalBonusDocs) {
        const deduction = (bonusDoc.bonusAmount / totalBonus) * amount;
        deductions.push(
          ReferralBonus.updateOne(
            { _id: bonusDoc._id },
            { $inc: { bonusAmount: -deduction } }
          )
        );
      }
    }

    // Execute all deductions
    await Promise.all(deductions);

    // Your remaining code for email and response
    await TwoFactor.deleteOne({ userId: id });

    // Your code for sending email remains here

    res.status(200).json({
      message: 'Your withdrawal request has been successfully processed.',
      redirectUrl: '/user/withdrawal-status',
    });
  } catch (err) {
    console.error('An error occurred while processing the withdrawal:', err);
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
  const { id } = req.user; // Get the user ID and role from req.user

  try {
    // Fetch all portfolios for this user
    const portfolios = await BuyPortfolio.find({ userId: id });

    // Calculate totalBalance across all portfolios
    let totalBalance = 0;
    portfolios.forEach(portfolio => {
      totalBalance += portfolio.balance;
    });

    // Fetch all referral bonuses for this user
    const totalBonusDocs = await ReferralBonus.find({ referringUserId: id });

    // Calculate totalBonus
    let totalBonus = 0;
    totalBonusDocs.forEach(bonusDoc => {
      if (bonusDoc.bonusAmount) {
        totalBonus += parseFloat(bonusDoc.bonusAmount);
      }
    });

    // Calculate the combined total for withdrawals
    const totalForWithdrawals = totalBalance + totalBonus;

    res.status(200).render('withdrawal/withdrawalrequest', {
      title: 'Withdrawal Request',
      totalForWithdrawals,
    });
  } catch (err) {
    console.log(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};

const getwithdrawalHistory = async (req, res, next) => {
  const { id, role } = req.user;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let conditions = {};

    if (role === 'admin') {
    } else if (role === 'personal') {
      conditions = { userId: id };
    }

    const count = await Transactions.countDocuments(conditions);
    const totalPages = Math.ceil(count / limit);

    const skip = (page - 1) * limit;

    const activities = await Transactions.find(conditions).populate({
      path: 'userId',
    });

    res.status(200).render('withdrawal/withdrawalhistory', {
      title: 'Withdrawal History',
      activities: activities,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
    });
  } catch (err) {
    console.log(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};

const getVerifyWithdrawal = async (req, res, next) => {
  const { id, role } = req.user;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let conditions = {};

    if (role === 'admin') {
    } else if (role === 'personal') {
      conditions = { userId: id };
    }

    const count = await Transactions.countDocuments(conditions);
    const totalPages = Math.ceil(count / limit);

    const skip = (page - 1) * limit;

    const activities = await Transactions.find(conditions).populate({
      path: 'userId',
    });

    res.status(200).render('withdrawal/verifyWithdrawal', {
      title: 'Withdrawal History',
      activities: activities,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
    });
  } catch (err) {
    console.log(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};

const getVerifyDetails = async (req, res, next) => {
  const paramId = req.params.id;

  try {
    const activities = await Transactions.findOne({ _id: paramId });

    const qrcodeDataURL = await QRCode.toDataURL(activities.walletAddress);

    res.status(200).render('withdrawal/verifyDetails', {
      title: 'Withdrawal Detail',
      activities: activities,
      qrcodeDataURL,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const postVerifyWithdrawal = async (req, res) => {
  const { paramId } = req.params;
  const user = req.user;

  try {
    // Get the current date
    const currentDate = new Date();

    // Update the transaction using the paramId
    const updatedTransaction = await Transactions.findOneAndUpdate(
      { _id: paramId, status: 'Pending Approval' },
      {
        date: currentDate,
        status: 'Approved',
      },
      { new: true }
    );

    if (!updatedTransaction) {
      console.log(
        `No transaction found with ID: ${paramId} and status: Pending Approval`
      );
      return res.status(404).send('Transaction not found or already approved.');
    }

    // Check if user._id matches updatedTransaction.userId
    if (user._id.toString() === updatedTransaction.userId.toString()) {
      // Prepare email content
      const email = user.email;
      const emailContent = 'Your payment has been approved.';

      // Send email to the user
      await sendEmail({
        email: email,
        subject: 'Payment confirmed',
        message: emailContent,
      });
    }

    // Redirect to user/verify-withdrawal
    res.redirect('/user/verify-withdrawal');
  } catch (err) {
    console.error('Error while verifying the withdrawal:', err.message);
    console.error(err.stack); // This logs the entire error stack for more detailed debugging
    res.status(500).send('An error occurred while verifying the withdrawal.');
  }
};

module.exports = {
  getActivity,
  getTransfer,
  postWithdrawal,
  getWithdrawalRequest,
  getwithdrawalHistory,
  getwithdrawalStatus,
  getVerifyWithdrawal,
  getVerifyDetails,
  postVerifyWithdrawal,
};
