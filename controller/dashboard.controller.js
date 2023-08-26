const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const referralBonus = require('../models/user/referralBonus.model');
const User = require('../models/user/user.model');
const Account = require('../models/user/account.model'); // Assuming you have an Account model

const dashboard = async (req, res) => {
  const { id } = req.user;
  try {
    const portfolios = await buyPortfolio.find({ userId: id });

    let totalBalance = 0;
    let totalCompBalance = 0;

    const portfolioData = portfolios.map(portfolio => {
      totalBalance += portfolio.balance;
      totalCompBalance += portfolio.compBalance; // Summing up all compBalance

      return {
        status: portfolio.status,
        balance: portfolio.balance,
        compBalance: portfolio.compBalance,
      };
    });

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
    // const accumulatedDividends = totalBalance + totalCompBalance + totalBonus;
    // const totalAccountBalance = totalBalance + totalBonus;
    // const compoundBalance = totalCompBalance; // Making it the total of all compBalance

    // const updatedAccount = await Account.findOneAndUpdate(
    //   { userId: id },
    //   {
    //     accumulatedDividends,
    //     totalAccountBalance,
    //     compoundingBalance: compoundBalance,
    //   },
    //   { upsert: true, new: true } // This will insert a new document if one doesn't already exist, and return the new document
    // );

    // Calculate new accumulatedDividends
    const newAccumulatedDividends =
      totalBalance + totalCompBalance + totalBonus;
    const totalAccountBalance = totalBalance + totalBonus;
    const compoundBalance = totalCompBalance; // Making it the total of all compBalance

    // Fetch the current value from the Account model
    const currentAccount = await Account.findOne({ userId: id });

    // Only update if the new value is greater than the current value
    const updatedAccumulatedDividends = currentAccount
      ? Math.max(currentAccount.accumulatedDividends, newAccumulatedDividends)
      : newAccumulatedDividends;

    // Update the Account model
    const updatedAccount = await Account.findOneAndUpdate(
      { userId: id },
      {
        accumulatedDividends: updatedAccumulatedDividends,
        totalAccountBalance,
        compoundingBalance: compoundBalance,
      },
      { upsert: true, new: true }
    );
    console.log(updatedAccount.accumulatedDividends);
    res.status(200).render('dashboard', {
      title: 'Dashboard',
      portfolioData,
      totalBonus,
      referredUsersCount,
      accumulatedDividends: updatedAccount.accumulatedDividends, // Fetch updated value from Account model
      totalAccountBalance: updatedAccount.totalAccountBalance, // Fetch updated value from Account model
      compoundBalance: updatedAccount.compoundingBalance, // Fetch updated value from Account model
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the portfolios.');
  }
};

module.exports = dashboard;
