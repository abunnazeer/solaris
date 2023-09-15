const AppError = require('../utils/appError');
const axios = require('axios');
const QRCode = require('qrcode');
const sendEmail = require('../utils/email');

// ACTIVITIES VIEW CONTROLLER

const BuyPortfolio = require('../models/portfolio/buyportfolio.model');
const Transactions = require('../models/portfolio/transaction.model');
const TwoFactor = require('../models/user/twoFactor.model');
const ReferralBonus = require('../models/user/referralBonus.model');
const Accounts = require('../models/user/accountDetails.model');
const Profile = require('../models/user/profile.model');

const getActivity = async (req, res, next) => {
  const { id, role } = req.user;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const getAllReferralBonus = await ReferralBonus.find({
      referringUserId: id,
    }).sort({ createdAt: -1 }); // Sort in descending order based on the creation date

    const filterCriteria = role === 'admin' ? {} : { userId: id };

    const [count, activities] = await Promise.all([
      Transactions.countDocuments(filterCriteria),
      Transactions.find(filterCriteria)
        .sort({ date: -1 }) // Sort in descending order based on date
        .populate('userId')
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Normalize activities and referral bonuses into a single array
    const normalizedActivities = activities.map(activity => ({
      title: activity.title,
      amount: activity.amount,
      date: activity.date,
      description: activity.description,
      status: activity.status,
    }));

    const normalizedReferralBonuses = getAllReferralBonus.map(bonus => ({
      title: 'Referral Bonus',
      amount: bonus.bonusAmount,
      date: bonus.createdAt,
      description: bonus.description,
      status: 'Credited',
    }));

    const combinedData = [
      ...normalizedActivities,
      ...normalizedReferralBonuses,
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort combined data by date in descending order

    res.status(200).render('activities/activity', {
      title: 'Transaction History',
      combinedData,
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
    // Fetch user's AccountDetail
    const userAccountDetail = await Accounts.findOne({ userId: id });

    if (!userAccountDetail) {
      return res.status(400).send('No account details found.');
    }

    if (
      userAccountDetail.totalAccountBalance < amount &&
      userAccountDetail.totalReferralBonus < amount
    ) {
      return res.status(400).send('Insufficient balance.');
    }

    let updateField =
      userAccountDetail.totalAccountBalance >= amount
        ? 'totalAccountBalance'
        : 'totalReferralBonus';

    // Update AccountDetail
    await Accounts.findOneAndUpdate(
      { userId: id },
      { $inc: { [updateField]: -amount } },
      { new: true }
    );

    // Generate a serial number
    function generateRandomNumber() {
      const min = 10000;
      const max = 99999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const date = new Date();

    const transActivityData = {
      sn: generateRandomNumber(),
      date: date,
      description: 'Withdrawal',
      status: 'Pending Approval',
      amount: amount,
      authCode: authCode,
      walletAddress: walletAddress,
      method: method,
      userId: id,
    };

    const transActivity = new Transactions(transActivityData);
    const savedTransActivity = await transActivity.save({
      validateBeforeSave: false,
    });

    if (!savedTransActivity) {
      return res.status(500).send('Failed to save transaction activity.');
    }

    await TwoFactor.deleteOne({ userId: id });

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
  const { id } = req.user; // Get the user ID from req.user

  try {
    // Fetch user's AccountDetail to get totalBalance
    const userAccountDetail = await Accounts.findOne({ userId: id });
    const totalBalance = userAccountDetail
      ? userAccountDetail.totalAccountBalance
      : 0;

    const totalBonus = userAccountDetail
      ? userAccountDetail.totalReferralBonus
      : 0;

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

    let conditions = { description: 'Withdrawal' };

    if (role === 'admin') {
      // No additional specific conditions for admin
    } else if (role === 'personal') {
      conditions.userId = id;
    } else {
      return res.status(403).send('Unauthorized');
    }

    const count = await Transactions.countDocuments(conditions);
    const totalPages = Math.ceil(count / limit);

    const skip = (page - 1) * limit;
    const activities = await Transactions.find(conditions)
      .sort({ date: -1 }) // Sorting by date in descending order
      .skip(skip)
      .limit(limit);

    const userIds = activities.map(activity => activity.userId);

    const profiles = await Profile.find({ _id: { $in: userIds } });

    const activitiesWithProfile = activities.map(activity => {
      const profile = profiles.find(
        profile => profile._id.toString() === activity.userId.toString()
      );
      return {
        ...activity._doc,
        profile,
      };
    });

    res.status(200).render('withdrawal/withdrawalhistory', {
      title: 'Withdrawal History',
      activities: activitiesWithProfile,
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

    let conditions = { description: 'Withdrawal' }; // Adding this condition to filter by 'Withdrawal'

    if (role === 'admin') {
      // No additional specific conditions for admin
    } else if (role === 'personal') {
      conditions.userId = id;
    } else {
      return res.status(403).send('Unauthorized');
    }

    const count = await Transactions.countDocuments(conditions);
    const totalPages = Math.ceil(count / limit);

    const skip = (page - 1) * limit;
    const activities = await Transactions.find(conditions)
      .sort({ date: -1 }) // Sorting by date in descending order
      .skip(skip)
      .limit(limit);

    // Get all userIds from the activities
    const userIds = activities.map(activity => activity.userId);

    // Fetch profiles based on those userIds
    const profiles = await Profile.find({ _id: { $in: userIds } });

    // Map profiles back to their corresponding activities
    const activitiesWithProfile = activities.map(activity => {
      const profile = profiles.find(
        profile => profile._id.toString() === activity.userId.toString()
      );
      return {
        ...activity._doc,
        profile,
      };
    });

    res.status(200).render('withdrawal/verifyWithdrawal', {
      title: 'Withdrawal History',
      activities: activitiesWithProfile,
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
