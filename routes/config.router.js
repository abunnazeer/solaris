const express = require('express');
const {
  getAllReferral,
  updateReferralConfig,
  updateReferralPercentage,
} = require('../controller/referral.controller');
const {
  getAllPayouts,
  createPayout,
  updatePayout,
  updatePayoutStatus,
  updatePortfolioPercentage,
} = require('../controller/payout.controller');
const {
  restrictTo,
  isLoggedIn,
  protect,
} = require('../controller/auth.controller');
const router = express.Router();
router.use(isLoggedIn);
router.get('/payout-settings', protect, restrictTo('admin'), getAllPayouts);
router.post('/create-payouts', protect, restrictTo('admin'), createPayout);
router.post(
  '/update-payout/:payoutId',
  protect,
  restrictTo('admin'),
  updatePayout
);
router.post(
  '/update-payoutStatus/:payoutId',
  protect,
  restrictTo('admin'),
  updatePayoutStatus
);

router.post(
  '/update-percentage/:portfolioId',
  protect,
  restrictTo('admin'),
  updatePortfolioPercentage
);
router.get('/referral-settings', protect, restrictTo('admin'), getAllReferral);
router.post(
  '/referral-settings',
  protect,
  restrictTo('admin'),
  updateReferralConfig
);

router.post(
  '/update-referral-percentage/:referralId',
  protect,
  restrictTo('admin'),
  updateReferralPercentage
);
module.exports = router;
