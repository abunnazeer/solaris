const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const referralBonus = require('../models/user/referralBonus.model');
const User = require('../models/user/user.model');

const dashboard = async (req, res) => {
  const { id } = req.user;
  try {
    // Assuming you have some logic to get the user's portfolios
    const portfolios = await buyPortfolio.find({ userId: id });

    const portfolioData = portfolios.map(portfolio => {
      return {
        status: portfolio.status,
        balance: portfolio.balance,
        compBalance: portfolio.compBalance,
      };
    });

    // Get the total number of users that you have referred (count)
    const referredUsersCount = await User.countDocuments({
      referredBy: id,
    });

    const totalBonusDocs = await referralBonus.find({ referringUserId: id });

    // Calculate the sum of bonusAmount values, ignoring documents without bonusAmount
    const totalBonus = totalBonusDocs.reduce((sum, bonusDoc) => {
      if (bonusDoc.bonusAmount) {
        return sum + parseFloat(bonusDoc.bonusAmount);
      }
      return sum; // Skip documents without bonusAmount
    }, 0);

    res.status(200).render('dashboard', {
      title: 'Dashboard',
      portfolioData, // Pass the extracted data to the view
      totalBonus, // Pass the calculated totalBonus to the view
      referredUsersCount, // Pass the count of referred users to the view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the portfolios.');
  }
};

module.exports = dashboard;
