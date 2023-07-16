const express = require('express');
// const slugify = require('slugify');

const {
  getReferral,
  getReferralBunus,
} = require('../controller/referral.controller');
const {
  restrictTo,
  isLoggedIn,
  protect,
} = require('../controller/auth.controller');

const router = express.Router();

router.use(isLoggedIn);
// REFERRAL VIEW
router.get('/referred-users', protect, getReferral);
router.get('/referral-bonus', protect, getReferralBunus);

module.exports = router;
