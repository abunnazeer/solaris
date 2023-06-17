const express = require('express');
const {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolio,
} = require('../controller/portfolio.controller');

const { getPortfolioForm } = require('../controller/view.portfolio');

const { restrictTo } = require('../controller/auth.controller');

const router = express.Router();

router.get(
  '/port/create-portfolio',
  restrictTo('admin', 'farmer'),
  getPortfolioForm
);

router.post('/port/create-portfolio', createPortfolio);
router.put('/port/portfolio/:id', updatePortfolio);
router.delete('/port/portfolio/:id', deletePortfolio);

module.exports = router;
