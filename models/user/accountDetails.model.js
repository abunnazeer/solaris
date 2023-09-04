const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountDetailSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming 'User' is your User model
    required: true,
  },
  TotalCompoundingBalance: {
    type: Number,
    required: true,
    default: 0.0,
  },
  accumulatedDividends: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalAccountBalance: {
    type: Number,
    required: true,
    default: 0.0,
  },

  totalReferralBonus: {
    type: Number,
    required: true,
    default: 0.0,
  },
});

const AccountDetail = mongoose.model('AccountDetail', accountDetailSchema);

module.exports = AccountDetail;
