const Portfolio = require('../models/portfolio.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get portfolio
const getPortfolio = catchAsync(async (req, res) => {
  const portfolio = await Portfolio.find();
  res.json(portfolio);
});

// Create portfolio
const createPortfolio = catchAsync(async (req, res, next) => {
  try {
    const portfolio = await Portfolio.create(req.body);
    console.log(req.body);
    res
      .status(201)
      .json({ message: 'Portfolio created successfully', portfolio });
  } catch (error) {
    return next(new AppError('Failed to create portfolio', 500));
  }
});

// Update portfolio
const updatePortfolio = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedPortfolio = req.body;

  try {
    const portfolio = await Portfolio.findByIdAndUpdate(id, updatedPortfolio, {
      new: true,
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio updated successfully', portfolio });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update portfolio' });
  }
});

// Delete portfolio
const deletePortfolio = catchAsync(async (req, res) => {
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
});

module.exports = {
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
