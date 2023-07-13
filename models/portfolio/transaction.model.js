const mongoose = require('mongoose');

const transactionsActivitySchema = new mongoose.Schema({
  sn: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
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
  description: {
    type: String,
    required: true,
  },
  buyPortfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
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
