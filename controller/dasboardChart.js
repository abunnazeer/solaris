const BuyPortfolio = require('../models/portfolio/buyportfolio.model');
const TransactionsActivity = require('../models/portfolio/transaction.model');
const referralBonus = require('../models/user/referralBonus.model');
const AccountDetail = require('../models/user/accountDetails.model');

// const getPieChart = async (req, res) => {
//   const { id } = req.user;

//   try {
//     // Assuming you have some logic to get the user's portfolios
//     const portfolios = await BuyPortfolio.find({ userId: id });

//     const totalCompBalance = portfolios.reduce((sum, portfolio) => {
//       return sum + portfolio.compBalance;
//     }, 0);

//     const totalAccountBalance = portfolios.reduce((sum, portfolio) => {
//       return sum + portfolio.balance;
//     }, 0);

//     res.status(200).json({
//       compBalance: totalCompBalance,
//       accountBalance: totalAccountBalance,
//     });
//   } catch (error) {
//     console.error('Error fetching dashboard data:', error);
//     res
//       .status(500)
//       .json({ error: 'An error occurred while fetching the dashboard data.' });
//   }
// };

const getPieChart = async (req, res) => {
  const { id } = req.user;

  try {
    // Assuming you have some logic to get the user's portfolios
    const accountDetails = await AccountDetail.find({ userId: id });

    res.status(200).json({
      accountDetails,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the dashboard data.' });
  }
};

const getBarChart = async (req, res) => {
  const { id } = req.user;

  try {
    // Assuming you have some logic to get the user's referral bonuses
    const bonus = await referralBonus.find({ referringUserId: id });
    const totalWithdrawal = await TransactionsActivity.find({
      userId: id,
      description: 'Withdrawal',
      status: 'Approved',
    });
    console.log(totalWithdrawal);
    const investedAmountArray = [];
    const withdrawedAmountArray = [];
    const referralBonusTotalArray = [];

    const totalInvested = await BuyPortfolio.find({ userId: id });

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

    res.status(200).json({
      investedAmount: investedAmountArray,
      totalWithdrawalAmount: withdrawedAmountArray,
      referralBonusTotal: referralBonusTotalArray,
      months: months, // Include the dynamic months array in the response
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the dashboard data.' });
  }
};

module.exports = {
  getPieChart,
  getBarChart,
};
