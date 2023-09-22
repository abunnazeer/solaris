
const BuyPortfolio = require('../models/portfolio/buyportfolio.model');
const Accounts = require('../models/user/accountDetails.model');
const PayoutConfig = require('../models/portfolio/payoutConfig.model');
const TransactionsActivity = require('../models/portfolio/transaction.model');
const AppError = require('../utils/appError');
const User = require('../models/user/user.model');

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const dailyPayout = async () => {
  const today = new Date();
  const dayName = daysOfWeek[today.getDay()];

  try {
    if (
      !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(
        dayName
      )
    ) {
      console.log('No daily payouts on weekends.');
      return;
    }

    const portfolios = await BuyPortfolio.find({
      status: 'active',
      amount: { $gt: 0 },
      payout: 'Daily Payout',
    });

    if (!portfolios || portfolios.length === 0) {
      console.log('No portfolios found for daily payout.');
      return;
    }

    let messages = [];

    for (const portfolio of portfolios) {
      const userId = portfolio.userId;

      let accountDetail = await Accounts.findOne({ userId });

      if (!accountDetail) {
        accountDetail = new Accounts({
          userId,
          TotalCompoundingBalance: 0.0,
          accumulatedDividends: 0.0,
          totalAccountBalance: 0.0,
          totalReferralBonus: 0.0,
        });
        await accountDetail.save();
      }

      const payout = parseFloat(
        ((portfolio.dailyPercentage / 100) * portfolio.amount).toFixed(2)
      );
      portfolio.balance += payout;
      await portfolio.save();

      await Accounts.findByIdAndUpdate(
        accountDetail._id,
        {
          $inc: {
            totalAccountBalance: payout,
            accumulatedDividends: payout,
          },
        },
        { new: true }
      );
      function generateRandomNumber() {
        const min = 10000;
        const max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const transActivity = new TransactionsActivity({
        sn: generateRandomNumber(),
        date: new Date(),
        title: 'Daily Payout commission',
        description: `Daily payout commission of $${payout} added to your account balance`,
        buyPortfolioId: portfolio._id,
        status: 'Credited',
        amount: payout.toFixed(2),
        userId,
        method: 'USDT',
        authCode: 0,
      });

      await transActivity.save();

      messages.push(
        `Payout of ${payout} added to balance for portfolio ${portfolio._id}`
      );
    }

    console.log(messages.join('\n'));
  } catch (err) {
    console.error(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};

const compoundingPayout = async () => {
  const today = new Date();
  const dayName = daysOfWeek[today.getDay()];

  try {
    if (
      !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(
        dayName
      )
    ) {
      console.log('No compounding payouts on weekends.');
      return;
    }

    const portfolios = await BuyPortfolio.find({
      status: 'active',
      amount: { $gt: 0 },
      payout: '12 Month Compounding',
    });

    if (!portfolios || portfolios.length === 0) {
      console.log('No portfolios found for compounding payout.');
      return;
    }

    let messages = [];

    const allUsers = await User.find(); // Fetch all users
    const userMap = new Map(allUsers.map(user => [user._id.toString(), user]));

    for (const portfolio of portfolios) {
      const userId = portfolio.userId.toString();

      if (userMap.has(userId)) {
        // If userId exists in User document
        let accountDetail = await Accounts.findOne({ userId });

        if (!accountDetail) {
          accountDetail = new Accounts({
            userId,
            TotalCompoundingBalance: 0.0,
            accumulatedDividends: 0.0,
            totalAccountBalance: 0.0,
            totalReferralBonus: 0.0,
          });
          await accountDetail.save();
        }

        const payout = parseFloat(
          ((portfolio.compPercentage / 100) * portfolio.amount).toFixed(2)
        );

        portfolio.amount += payout; // Increment amount by payout
        await portfolio.save();

        await Accounts.findByIdAndUpdate(
          accountDetail._id,
          {
            $inc: {
              TotalCompoundingBalance: payout,
              accumulatedDividends: payout,
            },
          },
          { new: true }
        );
        function generateRandomNumber() {
          const min = 10000;
          const max = 99999;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const transActivity = new TransactionsActivity({
          sn: generateRandomNumber(),
          date: new Date(),
          title: 'Compounding commission',
          description: `Compounding commission of $${payout} added to your ${portfolio.portfolioName}`,
          buyPortfolioId: portfolio._id,
          status: 'Credited',
          amount: payout.toFixed(2),
          userId,
          method: 'USDT',
          authCode: 0,
        });

        await transActivity.save();
        messages.push(
          `Payout of ${payout} added to compounding balance for portfolio ${portfolio._id}`
        );
      }
    }

    console.log(messages.join('\n'));
  } catch (err) {
    console.error(err);
    const error = new AppError('An error occurred', 500);
    next(error);
  }
};






module.exports = { dailyPayout, compoundingPayout };
