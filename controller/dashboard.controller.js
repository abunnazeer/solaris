const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const referralBonus = require('../models/user/referralBonus.model');
const User = require('../models/user/user.model');
const Account = require('../models/user/account.model'); // Assuming you have an Account model
const AccountDetail = require('../models/user/accountDetails.model'); // Assuming you have an Account model

const dashboard = async (req, res) => {
  const { id } = req.user;

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

    res.status(200).render('dashboard', {
      title: 'Dashboard',
      portfolioData,
      totalBonus,
      referredUsersCount,
      accumulatedDividends, // use the local variable here
      totalAccountBalance: grandTotal, // use the local variable here
      compoundBalance, // use the local variable here
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the portfolios.');
  }
};

module.exports = dashboard;
