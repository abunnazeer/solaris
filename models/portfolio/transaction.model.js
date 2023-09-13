const mongoose = require('mongoose');

const transactionsActivitySchema = new mongoose.Schema({
  title: {
    type: String,
  },
  sn: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  cryptoAmount: {
    type: Number,
  },
  authCode: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  method: {
    type: String,
    enum: ['BTC', 'ETH', 'USDT'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  buyPortfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Withdrawal',
      'Deposit',
      'Credited',
      'Failed',
      'Pending Approval',
      'Approved',
      'Re Invested',
    ],
    default: 'Pending',
  },
  walletAddress: {
    type: String,
  },
});

const TransactionsActivity = mongoose.model(
  'TransactionsActivity',
  transactionsActivitySchema
);

module.exports = TransactionsActivity;
