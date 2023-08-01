const mongoose = require('mongoose');

const referralConfigSchema = new mongoose.Schema({
  firstLevel: {
    type: Number,
    required: true,
    default: 0.1,
  },
  secondLevel: {
    type: Number,
    required: true,
    default: 0.05,
  },
  thirdLevel: {
    type: Number,
    required: true,
    default: 0.025,
  },
});

const ReferralConfig = mongoose.model('ReferralConfig', referralConfigSchema);
module.exports = ReferralConfig;
