// REFERRAL VIEW
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Portfolio = require('../models/portfolio/portfolio.model');
const buyPortfolio = require('../models/portfolio/buyportfolio.model');

const getReferral = async (req, res, next) => {
  const id = req.user._id;
  try {
    // Find the referring user
    const referringUser = await User.findById(id).populate('downlines.user');

    // Get the referred users from the downlines array
    const referredUserIds = referringUser.downlines.map(
      downline => downline.user
    );
    const referredUsers = await User.find({ _id: { $in: referredUserIds } });

    // Get the profiles for the referred users
    const profilePromises = referredUsers.map(user =>
      Profile.findOne({ _id: user._id })
    );
    const profiles = await Promise.all(profilePromises);

    // Get the buyPortfolio details for each referred user
    const buyPortfolioPromises = referredUsers.map(user =>
      buyPortfolio.findOne({ userId: user._id })
    );
    const buyPortfolios = await Promise.all(buyPortfolioPromises);

    // Combine the user, profile, and buyPortfolio data into referredUsersData array
    const referredUsersData = referredUsers.map((user, index) => ({
      user,
      profile: profiles[index],
      buyPortfolio: buyPortfolios[index],
    }));
    console.log(referredUsersData);
    // Perform pagination calculations
    const currentPage = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const totalUsers = referredUsersData.length;
    const totalPages = Math.ceil(totalUsers / limit);

    // Apply pagination to the referredUsersData array
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    const paginatedUsers = referredUsersData.slice(startIndex, endIndex);

    res.render('referrals/referredusers', {
      title: 'Referred Partners',
      referredUsers: paginatedUsers,
      totalPages,
      currentPage,
    });
  } catch (err) {
    next(err);
  }
};

const getReferralBunus = (req, res) => {
  res
    .status(200)
    .render('referrals/referralbonus', { title: 'Referral Bunus' });
};
module.exports = {
  getReferral,
  getReferralBunus,
};
