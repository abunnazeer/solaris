const mongoose = require('mongoose');

const payoutConfigSchema = new mongoose.Schema({
  payout: [
    {
      sn: {
        type: Number,
        required: true,
      },

      label: {
        type: String,
        required: true,
        unique: true,
      },
      payoutStatus: {
        type: String,
        enum: ['used', 'not used'],
        required: true,
      },
    },
  ],
});

const PayoutConfig = mongoose.model('PayoutConfig', payoutConfigSchema);

module.exports = PayoutConfig;
