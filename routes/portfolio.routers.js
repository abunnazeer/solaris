const express = require('express');
// const slugify = require('slugify');
const {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,

  uploadPortfolioPhoto,
} = require('../controller/portfolio.controller');

const {
  getPortfolioForm,
  getPortfolioIndex,
  getEditPortfolioForm,
  viewPortfolio,
  getBuyPortfolioForm,
  postBuyPortfolio,
  getPayment,
  updatePayment,
  getStatusIndex,
  paymentSucceeded,
  paymentComfirmation,
} = require('../controller/view.portfolio');

const {
  restrictTo,
  isLoggedIn,
  protect,
} = require('../controller/auth.controller');

const router = express.Router();
router.use(isLoggedIn);
router.get(
  '/portfolio/create-portfolio',
  restrictTo('admin'),
  getPortfolioForm
);
// PAYMENT ROUTE
router.post('/payment/:id', protect, updatePayment);
// router.post('/payment-completed/', protect, paymentSucceeded);
// router.get('/payment', protect, getPayment);
router.get('/payment/:id', protect, getPayment);
//////////////////user routes ////////////
router.post('/buy-portfolio/:id', protect, postBuyPortfolio);
router.get('/buy-portfolio/:id', protect, getBuyPortfolioForm);
// router.get('/buy-portfolio', buyPortfolioForm);

router.get('/create-portfolio', protect, getPortfolioForm);
router.get('/', protect, getPortfolioIndex);
router.get('/index', protect, restrictTo('admin'), getStatusIndex);
// router.get('/portfolio', getPortfolioIndex);
router.put(
  '/buyportfolio/:id',
  protect,
  restrictTo('admin'),
  paymentComfirmation
);
router.post(
  '/create-portfolio',
  protect,
  uploadPortfolioPhoto,
  createPortfolio
);
// router.put('/:id', updatePortfolio);
router.delete('/:id', protect, deletePortfolio);

// Route to render the edit form
router.get('/edit-portfolio/:id', protect, getEditPortfolioForm);

// Route to handle the update request
router.post('/update-portfolio/:id', protect, updatePortfolio);
// View single portfolio
router.get('/:id', protect, viewPortfolio);

module.exports = router;
