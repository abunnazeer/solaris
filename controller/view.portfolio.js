const Portfolio = require('../models/portfolio/portfolio.model');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

const getPortfolioForm = (req, res) => {
  res.status(200).render('portfolio/portfolioform', {
    title: 'Portfolio Form',
  });
};

// Render the edit form with the existing portfolio data
const getEditPortfolioForm = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.status(200).render('portfolio/portfolioedit', {
      title: 'Edit Portfolio',
      portfolio: portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

const getPortfolioIndex = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default: page 1)
  const limit = 10; // Number of items per page
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  const portfolioCount = await Portfolio.countDocuments();
  const totalPages = Math.ceil(portfolioCount / limit);

  const portfolio = await Portfolio.find()
    .select('title')
    .skip(skip)
    .limit(limit);

  res.render('portfolio/portfolioindex', {
    title: 'Manage Portfolio',
    portfolio: portfolio,
    currentPage: page,
    totalPages: totalPages,
  });
});

module.exports = {
  getPortfolioForm,
  getPortfolioIndex,
  getEditPortfolioForm,
};
