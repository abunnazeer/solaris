const express = require('express');
const {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolio,
} = require('../controller/portfolio.controller');
const { getPortfolioForm } = require('../controller/view.port.controller');

const router = express.Router();

router.get('/portfolio', getPortfolioForm);

router.post('/create-portfolio', createPortfolio);
router.put('portfolio/:id', updatePortfolio);
router.delete('portfolio/:id', deletePortfolio);

module.exports = router;
