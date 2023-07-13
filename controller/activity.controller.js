const AppError = require('../utils/appError');

// ACTIVITIES VIEW CONTROLLER

const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const Transactions = require('../models/portfolio/transaction.model');
const TwoFactor = require('../models/user/twoFactor.model');

const getActivity = async (req, res, next) => {
  const { id } = req.user._id;
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of activities per page

    const count = await Transactions.countDocuments(); // Total count of activities
    const totalPages = Math.ceil(count / limit); // Calculate total number of pages

    const skip = (page - 1) * limit; // Calculate number of activities to skip

    const activities = await Transactions.find({})
      .populate('buyPortfolioId')
      .skip(skip)
      .limit(limit);

    const buyPortfolioId = activities.buyPortfolioId;
    let payout = 'No value';

    if (buyPortfolioId) {
      const buyPortfolio = await buyPortfolio.findOne({ _id: buyPortfolioId });
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
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};

const postWithdrawal = async (req, res) => {
  const { amount, walletAddress, authCode } = req.body;
  try {
    // 1. Generate a serial number and assign it to `sn`

    function generateRandomNumber() {
      const min = 10000;
      const max = 99999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 2. Get the current date and assign it to `date`
    const date = new Date();

    // 3. Check if `buyPortfolio` payout is "daily" and the balance is not 0
    //    Then, get the `_id` and assign it to `buyPortfolioId` for TransactionsActivity
    let buyPortfolioId = null;
    const portfolioBuy = await buyPortfolio.findOne({
      payout: 'daily',
      balance: { $ne: 0 },
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
      status: buyPortfolioId ? 'pending' : 'cancelled',
      amount: amount,
      authCode: authCode,
      walletAddress: walletAddress,
    });

    // Save the TransactionsActivity document
    await transActivity.save();

    // Redirect to user activity after successful withdrawal
    res.redirect('/user/activity');
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

module.exports = {
  // Activity
  getActivity,
  getTransfer,
  postWithdrawal,
};
