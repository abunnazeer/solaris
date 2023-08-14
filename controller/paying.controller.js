const buyPortfolio = require('../models/portfolio/buyportfolio.model');

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const today = new Date();
const dayName = daysOfWeek[today.getDay()];

const dailyPayout = async (req, res) => {
  // Fetch the buyPortfolio for the user (replace with actual query)
  // const portfolio = await buyPortfolio.findOne({ userId: req.user._id });
  const portfolio = await buyPortfolio.findOne({ userId: req.user._id });
  console.log(portfolio);
  console.log(`Today is ${dayName}`);

  //   if (portfolio.status !== 'active') {
  //     return res.status(400).send('Portfolio is not active');
  //   }

  if (portfolio.status !== 'active') {
    console.log('Portfolio is not active');
    return res.status(400).send('Portfolio is not active');
  }
  // Check if the day is included in the daysOfWeek array
  if (!daysOfWeek.includes(dayName)) {
    return res.status(200).send('No payout today');
  }

  // Check if the portfolio has expired
  const startDate = new Date(portfolio.startDate);
  const expirationDate = new Date(startDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  //   if (today > expirationDate) {
  //     portfolio.status = 'expired';
  //     await portfolio.save();
  //     return res.status(400).send('Portfolio has expired');
  //   }
  if (today > expirationDate) {
    console.log('Portfolio has expired');
    portfolio.status = 'expired';
    await portfolio.save();
    return res.status(400).send('Portfolio has expired');
  }

  const payout = (portfolio.dailyPercentage / 100) * portfolio.amount; // Assuming dailyPercentage is 4
  console.log(`Calculated payout: ${payout}`); // Should log "Calculated payout: 40"
  portfolio.balance += payout;

  // Don't forget to save the updated portfolio
  await portfolio.save();

  res.status(200).send(`Payout of ${payout} added to balance`);
};

module.exports = dailyPayout;
