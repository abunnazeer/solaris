const mongoose = require('mongoose');

const buyPortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cryptoAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  amount: {
    type: Number,
    required: true,
  },
  compAmount: {
    type: Number,
    default: 0,
  },
  portfolioName: {
    type: String,
    required: true,
  },
  payout: {
    type: String,
    enum: ['daily', 'compounding'],
    required: true,
  },
  currency: {
    type: String,
    enum: ['BTC', 'ETH', 'USDT', 'DASH', 'BCH', 'BNB'],
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  compBalance: {
    type: Number,
    default: 0,
  },
  dateOfPurchase: {
    type: Date,
    required: true,
    default: new Date(),
  },
  dateOfExpiry: {
    type: Date,
    required: true,
    default: new Date(),
  },
  walletAddress: {
    type: String,
    default: 0,
  },
  portConfig: {
    daily: {
      type: Number,
      default: 12 * 30 * 24 * 60 * 60 * 1000, // Changed to represent 1 day (daily)
    },
    compounding: {
      type: Number,
      default: 12 * 30 * 24 * 60 * 60 * 1000,
    },
  },
  payoutName: {
    daily: {
      type: String,
      default: 'daily',
    },
    compounding: {
      type: String,
      default: 'compounding',
    },
  },
  dailyPercentage: {
    type: Number,
    default: 0.4,
  },
  compPercentage: {
    type: Number,
    default: 0.4,
  },
});

const BuyPortfolio = mongoose.model('BuyPortfolio', buyPortfolioSchema);

module.exports = BuyPortfolio;
