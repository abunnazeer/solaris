// controllers/payoutController.js
const catchAsync = require('../utils/catchAsync');
const PayoutConfig = require('../models/portfolio/payoutConfig.model');
const Portfolio = require('../models/portfolio/portfolio.model');

const createPayout = catchAsync(async (req, res) => {
  try {
    // Validate input data

    const label = req.body.label;

    if (!label) {
      return res
        .status(500)
        .render('response/status', { message: 'Invalid payout data' });
    }

    // Get the maximum existing sn from the database
    const maxSnPayout = await PayoutConfig.findOne()
      .sort({ 'payout.sn': -1 })
      .limit(1);

    // Calculate the next serial number (sn)
    const nextSn = maxSnPayout ? maxSnPayout.payout[0].sn + 1 : 0;

    // Create a new payout using the PayoutConfig model and provide the calculated sn
    const newPayout = await PayoutConfig.create({
      payout: [
        {
          sn: nextSn, // Set the serial number (sn)

          label,
          payoutStatus: 'not used',
        },
      ],
    });

    // Redirect to the payout settings route upon successful creation
    return res.redirect('/user/payout-settings');
  } catch (err) {
    console.error(err); // Log the error for debugging purposes

    return res
      .status(500)
      .render('response/status', { message: 'Error creating payout' });
  }
});

const getAllPayouts = catchAsync(async (req, res) => {
  try {
    const allPayouts = await PayoutConfig.find();
    const portfolio = await Portfolio.find();

    res.status(200).render('config/payout', {
      title: 'Payout Settings',
      portfolio: portfolio,
      payouts: allPayouts,
    });
  } catch (err) {
    return res
      .status(500)
      .render('response/status', { message: 'Error fetching payout data' });
  }
});

// Update an existing payout configuration
const updatePayout = catchAsync(async (req, res) => {
  const { payoutId } = req.params;
  const { label } = req.body;

  try {
    // Find the existing payout by its ID and update it in the database
    const existingPayout = await PayoutConfig.findById(payoutId);

    if (!existingPayout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    // Ensure that the 'payout' array exists and contains a single element
    if (!existingPayout.payout || existingPayout.payout.length !== 1) {
      return res
        .status(500)
        .json({ message: 'Invalid payout data in the database' });
    }

    // Update the 'label' and 'percentage' fields
    existingPayout.payout[0].label = label;

    // Save the updated document back to the database
    await existingPayout.save();

    // return res.status(200).json({ message: 'success' });
    return res.redirect('/user/payout-settings');
  } catch (err) {
    // Log the error
    console.error('Error updating payout:', err);

    // Handle errors
    return res.status(500).json({ message: 'Error updating payout' });
  }
});

const updatePortfolioPercentage = catchAsync(async (req, res) => {
  const { portfolioId } = req.params;
  const { rioPercentage, cPercentage } = req.body;

  try {
    // Find the existing Portfolio by its ID and update it in the database
    const existingPortfolio = await Portfolio.findById(portfolioId);

    if (!existingPortfolio) {
      console.log('Portfolio not found:', portfolioId);

      return res.status(500).render('response/status', {
        message: 'Portfolio percentage not found',
      });
    }

    // Ensure that the nested properties 'returnOnInvestment' and 'compounding' exist
    if (
      !existingPortfolio.returnOnInvestment ||
      !existingPortfolio.compounding
    ) {
      return res.status(500).render('response/status', {
        message: 'Invalid Portfolio structure in the database',
      });
    }

    // Update the 'Roi Percentage' and 'compounding percentage' fields
    existingPortfolio.returnOnInvestment.rioPercentage = rioPercentage;
    existingPortfolio.compounding.cPercentage = cPercentage;

    // Save the updated document back to the database
    await existingPortfolio.save();

    // Redirect to the payout settings route upon successful creation
    return res.redirect('/user/payout-settings');
  } catch (err) {
    // Log the error

    console.error('Error updating Portfolio percentage:', err);

    // Handle errors
    return res.status(500).render('response/status', {
      message: 'Error updating Portfolio percentage',
    });
  }
});

// Update an existing payout configuration
const updatePayoutStatus = catchAsync(async (req, res) => {
  const { payoutId } = req.params;
  const { payoutStatus } = req.body;

  try {
    // Find the existing payout by its ID and update the payoutStatus in the database
    const existingPayout = await PayoutConfig.findByIdAndUpdate(
      payoutId,
      { 'payout.0.payoutStatus': payoutStatus },
      { new: true, runValidators: true }
    );

    if (!existingPayout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    return res
      .status(200)
      .json({ message: 'success', updatedPayout: existingPayout });
  } catch (err) {
    // Log the error
    console.error('Error updating payout status:', err);

    // Handle errors
    return res.status(500).json({ message: 'Error updating payout status' });
  }
});

module.exports = {
  getAllPayouts,
  createPayout,
  updatePayout,
  updatePayoutStatus,
  updatePortfolioPercentage,
};
