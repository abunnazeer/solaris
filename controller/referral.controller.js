// REFERRAL VIEW
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Bonus = require('../models/user/referralBonus.model');
const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const ReferralConfig = require('../models/user/referralConfig.model');

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

    // Perform pagination calculations
    const currentPage = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const totalUsers = referredUsersData.length;
    const totalPages = Math.ceil(totalUsers / limit);

    // Apply pagination to the referredUsersData array
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    const paginatedUsers = referredUsersData.slice(startIndex, endIndex);

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/user/register`;
    res.render('referrals/referredusers', {
      title: 'Referred Partners',
      referredUsers: paginatedUsers,
      totalPages,
      currentPage,
      url,
      referringUser,
    });
  } catch (err) {
    next(err);
  }
};

const getReferralBonus = async (req, res, next) => {
  const id = req.user._id;
  try {
    // Get all the amounts related to the user
    const getAllReferalBonus = await Bonus.find({
      referringUserId: id,
      user: id,
    });

    const currentPage = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const totalUsers = getAllReferalBonus.length;
    const totalPages = Math.ceil(totalUsers / limit);

    // Apply pagination to the getAllReferalBonus array
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    const paginatedUsers = getAllReferalBonus.slice(startIndex, endIndex);

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/user/register`;
    res.render('referrals/referralbonus', {
      title: 'Referred Partners',
      referredUsers: paginatedUsers,
      totalPages,
      currentPage,
      url,
      referringUser: req.user,
      limit,
    });
  } catch (err) {
    next(err);
  }
};
const getAllReferral = catchAsync(async (req, res) => {
  try {
    const allReferral = await ReferralConfig.find();

    res.status(200).render('config/referral', {
      title: 'Referral Settings',
      referrals: allReferral,
    });
  } catch (err) {
    return res
      .status(500)
      .render('response/status', { message: 'Error fetching referral data' });
  }
});



// Function to initialize the referral configuration if it doesn't exist in the database
const initializeReferralConfig = async () => {
  try {
    const existingConfig = await ReferralConfig.findOne();
    if (!existingConfig) {
      // Create and save the initial configuration
      await ReferralConfig.create({
        firstLevel: 0.1,
        secondLevel: 0.05,
        thirdLevel: 0.025,
      });
    }
  } catch (err) {
    console.error('Error initializing referral configuration:', err);
  }
};

// Call this function once in your application to initialize the configuration
initializeReferralConfig();

// Function to update the referral percentage configuration
const updateReferralConfig = catchAsync(async (req, res) => {
  try {
    // Validate input data
    const { firstLevel, secondLevel, thirdLevel } = req.body;

    // Find the existing configuration
    const existingConfig = await ReferralConfig.findOne();

    if (!existingConfig) {
      return res.status(404).render('response/status', {
        message: 'Referral Configuration not found',
      });
    }

    // Update the values
    existingConfig.firstLevel = firstLevel;
    existingConfig.secondLevel = secondLevel;
    existingConfig.thirdLevel = thirdLevel;

    // Save the updated configuration
    await existingConfig.save();

    // Redirect to the payout settings route upon successful update
    return res.redirect('/user/payout-settings');
  } catch (err) {
    console.error('Error updating referral configuration:', err);
    return res
      .status(500)
      .render('response/status', { message: 'Error updating payout' });
  }
});

// Update an existing payout configuration
const updateReferralPercentage = catchAsync(async (req, res) => {
  const { referralId } = req.params;
  const { firstLevel, secondLevel, thirdLevel } = req.body;

  try {
    // Find the existing payout by its ID and update it in the database
    const existingReferral = await ReferralConfig.findById(referralId);

    if (!existingReferral) {
      return res.status(404).json({ message: 'Referal Percentage not found' });
    }

    // Update the 'firstLevel,secondLevel,thirdLevel' and 'percentage' fields
    existingReferral.firstLevel = firstLevel;
    existingReferral.secondLevel = secondLevel;
    existingReferral.thirdLevel = thirdLevel;

    // Save the updated document back to the database
    await existingReferral.save();

    // return res.status(200).json({ message: 'success' });
    return res.redirect('/user/referral-settings');
  } catch (err) {
    // Log the error
    console.error('Error updating Referral:', err);

    // Handle errors
    return res.status(500).json({ message: 'Error updating referal' });
  }
});

module.exports = {
  getReferral,
  getReferralBonus,
  getAllReferral,
  updateReferralPercentage,
  updateReferralConfig,
};
