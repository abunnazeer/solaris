const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  minimumCapital: {
    type: String,
    required: true,
  },
  returnOnInvestment: {
    type: String,
    required: true,
  },
  portfolioDuration: {
    type: String,
    required: true,
  },
  closingSoon: {
    type: Boolean,
    default: false,
  },
  weeklyEarnings: {
    type: String,
    required: true,
  },
  targetSize: {
    type: String,
    required: true,
  },
  reimbursement: {
    type: String,
    required: true,
  },
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
