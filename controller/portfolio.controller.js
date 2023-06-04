const Portfolio = require('../models/portfolio.model');
const catchAsync = require('../utils/catchAsync');

// Get portfolio
const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
};

// Create portfolio
const createPortfolio = catchAsync(async (req, res) => {
  try {
    const portfolio = new Portfolio({
      title: req.body.title,
      minimumCapital: req.body.minimumCapital,
      returnOnInvestment: req.body.returnOnInvestment,
      portfolioDuration: req.body.portfolioDuration,
      weeklyEarnings: req.body.weeklyEarnings,
      targetSize: req.body.targetSize,
      reimbursement: req.body.reimbursement,
    });

    await portfolio.save();
    res
      .status(201)
      .json({ message: 'Portfolio created successfully', portfolio });
  } catch (error) {
    // res.status(500).json({ message: 'Failed to create portfolio' });
    return next(new AppError('Failed to create portfolio', 500));
  }
});

// Update portfolio
const updatePortfolio = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    minimumCapital,
    returnOnInvestment,
    portfolioDuration,
    closingSoon,
    weeklyEarnings,
    targetSize,
    reimbursement,
  } = req.body;

  try {
    const portfolio = await Portfolio.findByIdAndUpdate(
      id,
      {
        title,
        minimumCapital,
        returnOnInvestment,
        portfolioDuration,
        closingSoon,
        weeklyEarnings,
        targetSize,
        reimbursement,
      },
      { new: true }
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio updated successfully', portfolio });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update portfolio' });
  }
};

// Delete portfolio
const deletePortfolio = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPortfolio = await Portfolio.findByIdAndRemove(id);

    if (!deletedPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete portfolio' });
  }
};

module.exports = {
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
