const mongoose = require('mongoose');

const TwoFactorSchema = new mongoose.Schema({
  code: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const TwoFactor = mongoose.model('TwoFactor', TwoFactorSchema);

module.exports = TwoFactor;
