const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const referralBonus = require('../models/user/referralBonus.model');
const User = require('../models/user/user.model');
const Account = require('../models/user/account.model'); // Assuming you have an Account model
const AccountDetail = require('../models/user/accountDetails.model'); // Assuming you have an Account model
const TransactionsActivity = require('../models/portfolio/transaction.model');
const referralBonusx = require('../models/user/referralBonus.model');

const dashboard = async (req, res) => {
  // const userParam = req.param;
  const { id } = req.user;

  try {
    // chart detail
    // Assuming you have some logic to get the user's referral bonuses
    const bonus = await referralBonus.find({ referringUserId: id });
    const totalWithdrawal = await TransactionsActivity.find({
      userId: id,
      description: 'Withdrawal',
      status: 'Approved',
    });

    const investedAmountArray = [];
    const withdrawedAmountArray = [];
    const referralBonusTotalArray = [];

    const totalInvested = await buyPortfolio.find({ userId: id });

    totalInvestAmount = totalInvested.reduce(
      (sum, invested) => sum + invested.amount,
      0
    );
    investedAmountArray.push(totalInvestAmount); // Add to investedAmountArray
    console.log('Total invest Amount:', investedAmountArray);

    const totalWithdrawalAmount = totalWithdrawal.reduce(
      (sum, withdrawed) => sum + withdrawed.amount,
      0
    );
    withdrawedAmountArray.push(totalWithdrawalAmount); // Add the total withdrawal amount

    // Extract createdAt dates for referral bonuses
    const referralBonusDates = bonus.map(item => item.createdAt);

    // Extract createdAt dates for withdrawals
    const withdrawalDates = totalWithdrawal.map(item => item.createdAt);

    // Extract createdAt dates for investments
    const investedDates = totalInvested.map(item => item.createdAt);

    // Merge and filter out invalid dates
    const allDates = [
      ...referralBonusDates,
      ...withdrawalDates,
      ...investedDates,
    ].filter(date => !isNaN(new Date(date).getTime()));

    // Create a Set of unique months
    const uniqueMonthsSet = new Set(
      allDates.map(date =>
        new Date(date).toLocaleString('en-US', { month: 'long' })
      )
    );

    const months = Array.from(uniqueMonthsSet); // Unique months

    // Calculate the total referral bonus amount and add to referralBonusTotalArray
    const totalReferralBonus = bonus.reduce(
      (sum, bonusDoc) => sum + bonusDoc.bonusAmount,
      0
    );
    referralBonusTotalArray.push(totalReferralBonus);

    // dashbard detail
    const portfolios = await buyPortfolio.find({ userId: id });
    const portfoliosBalance = await AccountDetail.findOne({ userId: id });

    const portfolioData = portfolios.map(portfolio => {
      return {
        status: portfolio.status,
      };
    });

    let accumulatedDividends = 0;
    let totalAccountBalance = 0;
    let compoundBalance = 0;
    let totalReferralBalance = 0;

    if (portfoliosBalance) {
      accumulatedDividends = portfoliosBalance.accumulatedDividends;
      totalAccountBalance = portfoliosBalance.totalAccountBalance;
      compoundBalance = portfoliosBalance.TotalCompoundingBalance;
      totalReferralBalance = portfoliosBalance.totalReferralBonus;
    }

    const referredUsersCount = await User.countDocuments({
      referredBy: id,
    });

    const totalBonusDocs = await referralBonus.find({ referringUserId: id });

    let totalBonus = 0;
    totalBonusDocs.forEach(bonusDoc => {
      if (bonusDoc.bonusAmount) {
        totalBonus += parseFloat(bonusDoc.bonusAmount);
      }
    });

    const grandTotal = totalAccountBalance + totalReferralBalance;

    res.status(200).render('dashboard', {
      title: 'Dashboard',
      portfolioData,
      totalBonus,
      referredUsersCount,
      accumulatedDividends, // use the local variable here
      totalAccountBalance: grandTotal, // use the local variable here
      compoundBalance, // use the local variable here
      // chart  data
      investedAmount: investedAmountArray,
      totalWithdrawalAmount: withdrawedAmountArray,
      referralBonusTotal: referralBonusTotalArray,
      months: months, // Include the dynamic months array in the response
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the portfolios.');
  }
};

const userDashboard = async (req, res) => {
  const userParam = req.params.id; // assuming "userId" is the param you're using
  let id;

  // Check if admin and userParam exists
  if (req.user.role === 'admin' && userParam) {
    id = userParam;
  } else {
    id = req.user.id;
  }

  try {
    const portfolios = await buyPortfolio.find({ userId: id });
    const portfoliosBalance = await AccountDetail.findOne({ userId: id });

    const portfolioData = portfolios.map(portfolio => {
      return {
        status: portfolio.status,
      };
    });

    let accumulatedDividends = 0;
    let totalAccountBalance = 0;
    let compoundBalance = 0;
    let totalReferralBalance = 0;

    if (portfoliosBalance) {
      accumulatedDividends = portfoliosBalance.accumulatedDividends;
      totalAccountBalance = portfoliosBalance.totalAccountBalance;
      compoundBalance = portfoliosBalance.TotalCompoundingBalance;
      totalReferralBalance = portfoliosBalance.totalReferralBonus;
    }

    const referredUsersCount = await User.countDocuments({
      referredBy: id,
    });

    const totalBonusDocs = await referralBonus.find({ referringUserId: id });

    let totalBonus = 0;
    totalBonusDocs.forEach(bonusDoc => {
      if (bonusDoc.bonusAmount) {
        totalBonus += parseFloat(bonusDoc.bonusAmount);
      }
    });

    const grandTotal = totalAccountBalance + totalReferralBalance;

    res.status(200).render('users_dashboard', {
      title: 'Dashboard',
      portfolioData,
      totalBonus,
      referredUsersCount,
      accumulatedDividends,
      totalAccountBalance: grandTotal,
      compoundBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the portfolios.');
  }
};

module.exports = { dashboard, userDashboard };
