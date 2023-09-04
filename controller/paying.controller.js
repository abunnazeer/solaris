
const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const Accounts = require('../models/user/accountDetails.model');
const PayoutConfig = require('../models/portfolio/payoutConfig.model');

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const today = new Date();
const dayName = daysOfWeek[today.getDay()];

const dailyPayout = async (req, res) => {
  const portfolios = await buyPortfolio.find({ userId: req.user._id });
  const allPayouts = await PayoutConfig.find();

  if (portfolios.length === 0) {
    return res.status(400).send('No portfolios found');
  }

  let messages = [];

  // Fetch AccountDetail where userId matches
  let accountDetail = await Accounts.findOne({ userId: req.user._id });

  if (!accountDetail) {
    // Initialize new AccountDetail with default values if not found
    accountDetail = new Accounts({
      userId: req.user._id,
      TotalCompoundingBalance: 0.0,
      accumulatedDividends: 0.0,
      totalAccountBalance: 0.0,
      totalReferralBonus: 0.0,
    });
    await accountDetail.save();
  }
const payoutName= allPayouts[0].payout[0].label
  for (const portfolio of portfolios) {
   
    if (portfolio.status !== 'active' || portfolio.payout !== payoutName) {
      messages.push(
        `Portfolio ${portfolio._id} is not eligible for daily payout`
      );
      continue;
    }

    if (!daysOfWeek.includes(dayName)) {
      messages.push(`No payout today for portfolio ${portfolio._id}`);
      continue;
    }

    if (!portfolio.amount) {
      messages.push(
        `Portfolio ${portfolio._id} has an empty amount, skipping.`
      );
      continue;
    }

    const startDate = new Date(portfolio.startDate);
    const expirationDate = new Date(startDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    if (today > expirationDate) {
      portfolio.status = 'expired';
      await portfolio.save();
      messages.push(`Portfolio ${portfolio._id} has expired`);
      continue;
    }

    const payout = parseFloat(
      ((portfolio.dailyPercentage / 100) * portfolio.amount).toFixed(2)
    );
    portfolio.balance += payout;
    await portfolio.save();

    // Update totalAccountBalance and accumulatedDividends in AccountDetail
    await Accounts.findByIdAndUpdate(
      accountDetail._id,
      {
        $inc: {
          totalAccountBalance: payout,
          accumulatedDividends: payout, // Assuming you also want to increment this by the same amount
        },
      },
      { new: true }
    );

    messages.push(
      `Payout of ${payout} added to balance for portfolio ${portfolio._id}`
    );
  }

  res.status(200).send(messages.join('\n'));
};

const compoundingPayout = async (req, res) => {
  const portfolios = await buyPortfolio.find({ userId: req.user._id });


  if (portfolios.length === 0) {
    return res.status(400).send('No portfolios found');
  }

  let messages = [];

  // Fetch AccountDetail where userId matches
  let accountDetail = await Accounts.findOne({ userId: req.user._id });

  if (!accountDetail) {
    // Initialize new AccountDetail with default values if not found
    accountDetail = new Accounts({
      userId: req.user._id,
      TotalCompoundingBalance: 0.0,
      accumulatedDividends: 0.0,
      totalAccountBalance: 0.0,
      totalReferralBonus: 0.0,
    });
    await accountDetail.save();
  }
  
  for (const portfolio of portfolios) {
  
    if (portfolio.status !== 'active' || portfolio.payout !== "12 Month Compounding") {
      messages.push(
        ` No compounding payout -  `
      );
      continue;
    }

    if (!daysOfWeek.includes(dayName)) {
      messages.push(`No payout today for portfolio`);
      continue;
    }

    if (!portfolio.amount) {
      messages.push(
        `Can't pay with an empty amount, skipping.`
      );
      continue;
    }

    const startDate = new Date(portfolio.startDate);
    const expirationDate = new Date(startDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    if (today > expirationDate) {
      portfolio.status = 'expired';
      await portfolio.save();
      messages.push(`Portfolio has expired`);
      continue;
    }

    const payout = parseFloat(
      ((portfolio.compPercentage / 100) * portfolio.amount).toFixed(2)
    );
    portfolio.compBalance += payout;
    await portfolio.save();

    // Update totalAccountBalance and accumulatedDividends in AccountDetail
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

    messages.push(
      `Payout of ${payout} added to balance for portfolio`
    );
  }

  res.status(200).send(messages.join('\n'));
};




module.exports = { dailyPayout, compoundingPayout };
