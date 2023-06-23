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
    enum: ['daily payout', '12 month compounding'],
    required: true,
  },
  currency: {
    type: String,
    enum: ['Bitcoin', 'Ethereum', 'Tether USD TRC20', 'Tether USD ERC20'],
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
  walletAddress: {
    type: String,
    default: 0,
  },
});

const BuyPortfolio = mongoose.model('BuyPortfolio', buyPortfolioSchema);

module.exports = BuyPortfolio;
