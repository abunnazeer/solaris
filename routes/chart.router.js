const express = require('express');

const {
  restrictTo,
  isLoggedIn,
  protect,
} = require('../controller/auth.controller');
const { getPieChart, getBarChart } = require('../controller/dasboardChart');
const router = express.Router();
router.use(isLoggedIn);

router.get('/pie-chart', protect, getPieChart);
router.get('/bar-chart', protect, getBarChart);

module.exports = router;
