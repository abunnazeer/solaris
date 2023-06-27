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
  portfolioName: {
    type: String,
    required: true,
  },
  payout: {
    type: String,
    enum: ['threeseconds', 'hourly', 'daily', 'weekly', 'annualy'],
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
    threesecond: {
      type: Number,
      default: 1000,
    },
    halfhour: {
      type: Number,
      default: 30 * 60 * 1000,
    },
    hourly: {
      type: Number,
      default: 60 * 60 * 1000,
    },
    daily: {
      type: Number,
      default: 24 * 60 * 60 * 1000,
    },
    weekly: {
      type: Number,
      default: 7 * 24 * 60 * 60 * 1000,
    },
  },
  payoutName: {
    threesecond: {
      type: String,
      default: 'threesecond',
    },
    hourly: {
      type: String,
      default: 'hourly',
    },
    daily: {
      type: String,
      default: 'daily',
    },
    weekly: {
      type: String,
      default: 'weekly',
    },
    annualy: {
      type: String,
      default: 'annualy',
    },
  },
});

const BuyPortfolio = mongoose.model('BuyPortfolio', buyPortfolioSchema);

module.exports = BuyPortfolio;
