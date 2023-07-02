// module.exports = Portfolio;
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  portfolioTitle: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  minimumCapital: {
    type: String,
    required: true,
  },
  returnOnInvestment: {
    name: {
      type: String,
      required: true,
    },
    rioPText: {
      type: String,
      required: true,
    },
    rioPercentage: {
      type: Number,
      required: true,
    },
  },

  compounding: {
    name: {
      type: String,
      required: true,
    },
    cPText: {
      type: String,
      required: true,
    },
    cPercentage: {
      type: Number,
      required: true,
    },
  },
  duration: {
    type: String,
    required: true,
  },
  closingSoon: {
    type: Boolean,
    default: false,
  },

  imageName: {
    type: String, // Adjust this type according to your needs
    required: true,
  },
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
