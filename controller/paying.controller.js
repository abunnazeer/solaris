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
  const portfolios = await buyPortfolio.find({ userId: req.user._id });

  if (portfolios.length === 0) {
    return res.status(400).send('No portfolios found');
  }

  let messages = [];

  for (const portfolio of portfolios) {
    console.log(`Processing portfolio ${portfolio._id}`);
    if (portfolio.status !== 'active') {
      messages.push(`Portfolio ${portfolio._id} is not active`);
      continue;
    }

    if (!daysOfWeek.includes(dayName)) {
      messages.push(`No payout today for portfolio ${portfolio._id}`);
      continue;
    }

    const startDate = new Date(portfolio.startDate);
    const expirationDate = new Date(startDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    if (today > expirationDate) {
      portfolio.status = 'expired';
      await portfolio.save();
      messages.push(`Portfolio ${portfolio._id} has expired`);
      continue;
    }

    const payout = (portfolio.dailyPercentage / 100) * portfolio.amount;
    portfolio.balance += payout;
    await portfolio.save();

    messages.push(
      `Payout of ${payout} added to balance for portfolio ${portfolio._id}`
    );
  }

  res.status(200).send(messages.join('\n'));
};

const compoundingPayout = async (req, res) => {
  const portfolios = await buyPortfolio.find({ userId: req.user._id });

  if (portfolios.length === 0) {
    return res.status(400).send('No portfolios found');
  }

  let messages = [];

  for (const portfolio of portfolios) {
    console.log(`Processing portfolio ${portfolio._id}`);
    if (portfolio.status !== 'active') {
      messages.push(`Portfolio ${portfolio._id} is not active`);
      continue;
    }

    if (!daysOfWeek.includes(dayName)) {
      messages.push(
        `No compounding payout today for portfolio ${portfolio._id}`
      );
      continue;
    }

    const startDate = new Date(portfolio.startDate);
    const expirationDate = new Date(startDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    if (today > expirationDate) {
      portfolio.status = 'expired';
      await portfolio.save();
      messages.push(`Portfolio ${portfolio._id} has expired`);
      continue;
    }

    const payout = (portfolio.compPercentage / 100) * portfolio.amount;
    portfolio.compBalance += payout;
    await portfolio.save();

    messages.push(
      `Compounding payout of ${payout} added to compBalance for portfolio ${portfolio._id}`
    );
  }

  res.status(200).send(messages.join('\n'));
};




module.exports = { dailyPayout, compoundingPayout };
