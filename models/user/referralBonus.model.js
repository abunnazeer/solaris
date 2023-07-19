const mongoose = require('mongoose');

// Define the ReferralBonus schema
const referralBonusSchema = new mongoose.Schema({
  referringUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model, representing the user who referred someone
    required: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model, representing the user who was referred
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  bonusAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

// Create the ReferralBonus model
const ReferralBonus = mongoose.model('ReferralBonus', referralBonusSchema);

module.exports = ReferralBonus;
