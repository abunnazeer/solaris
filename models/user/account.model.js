const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming 'User' is your User model
    required: true,
  },
  compoundingBalance: {
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
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
