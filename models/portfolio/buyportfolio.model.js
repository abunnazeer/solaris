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
    enum: ['weekly', 'annually'],
    required: true,
  },
  currency: {
    type: String,
    enum: ['Bitcoin', 'Ethereum', 'usdt'],
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
    weekly: {
      type: Number,
      default: 7 * 24 * 60 * 60 * 1000,
    },
    annually: {
      type: Number,
      default: 7 * 24 * 60 * 60 * 1000,
    },
  },
  payoutName: {
    weekly: {
      type: String,
      default: 'weekly',
    },
    annually: {
      type: String,
      default: 'annually',
    },
  },
});

const BuyPortfolio = mongoose.model('BuyPortfolio', buyPortfolioSchema);

module.exports = BuyPortfolio;
