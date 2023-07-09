const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const { emiting } = require('../server');

function sendBalanceUpdate(portfolioId, balance, compBalance) {
  const message = JSON.stringify({ portfolioId, balance, compBalance });
  emiting('balanceUpdate', message);
}

const updatePortfolio = async (
  portfolio,
  dailyPercentage,
  millisecondsInDay,
  dailyInterval
) => {
  let balance;
  let compBalance;
  let currentTime = Date.parse(portfolio.dateOfPurchase);
  const terminationTime = Date.parse(portfolio.dateOfExpiry);

  if (portfolio.payout === 'compounding') {
    compBalance = portfolio.compBalance;
  } else {
    balance = portfolio.balance;
  }

  const intervalId = setInterval(async () => {
    if (portfolio.status === 'inactive') {
      clearInterval(intervalId);
      return;
    }

    if (currentTime >= terminationTime) {
      clearInterval(intervalId);
      await buyPortfolio.findByIdAndUpdate(portfolio._id, {
        status: 'inactive',
      });
      return;
    }

    let newBalance;
    if (portfolio.payout === 'compounding') {
      newBalance = compBalance + portfolio.compPercentage * portfolio.amount;
    } else {
      newBalance = balance + dailyPercentage * portfolio.amount;
    }

    let updatedPortfolio;
    if (portfolio.payout === 'compounding') {
      updatedPortfolio = await buyPortfolio.findByIdAndUpdate(
        portfolio._id,
        {
          compBalance: newBalance,
          compAmount: newBalance + portfolio.amount,
        },
        { new: true }
      );
    } else {
      updatedPortfolio = await buyPortfolio.findByIdAndUpdate(
        portfolio._id,
        { balance: newBalance },
        { new: true }
      );
    }

    sendBalanceUpdate(
      updatedPortfolio._id,
      updatedPortfolio.balance,
      updatedPortfolio.compBalance
    );

    if (portfolio.payout === 'compounding') {
      compBalance = newBalance;
    } else {
      balance = newBalance;
    }

    currentTime += millisecondsInDay;
  }, dailyInterval);
};

let portfolios = [];

const dashboard = async (req, res) => {
  try {
    const user = req.user.id;
    portfolios = await buyPortfolio.find({ userId: user });

    for (const portfolio of portfolios) {
      if (
        portfolio.payout === portfolio.payoutName[portfolio.payout] &&
        portfolio.payout !== 'compounding' &&
        portfolio.status === 'active'
      ) {
        const dailyInterval = portfolio.portConfig[portfolio.payout];
        if (dailyInterval > 0) {
          updatePortfolio(
            portfolio,
            portfolio.dailyPercentage,
            24 * 60 * 60 * 1000,
            dailyInterval
          );
        }
      }

      if (
        portfolio.payout === portfolio.payoutName['compounding'] &&
        portfolio.payout !== 'daily' &&
        portfolio.status === 'active'
      ) {
        const dailyInterval = portfolio.portConfig[portfolio.payout];
        if (dailyInterval > 0) {
          let compBalance = portfolio.compBalance;
          let currentTime = Date.parse(portfolio.dateOfPurchase);
          const terminationTime = Date.parse(portfolio.dateOfExpiry);
          const intervalId = setInterval(async () => {
            if (portfolio.status === 'inactive') {
              clearInterval(intervalId);
              return;
            }
            if (currentTime >= terminationTime) {
              clearInterval(intervalId);
              await buyPortfolio.findByIdAndUpdate(portfolio._id, {
                status: 'inactive',
              });
              return;
            }
            const newCompBalance =
              compBalance + portfolio.compPercentage * portfolio.amount;

            const updatedPortfolio = await buyPortfolio.findByIdAndUpdate(
              portfolio._id,
              {
                compBalance: newCompBalance,
                compAmount: newCompBalance + portfolio.amount,
              },
              { new: true }
            );

            sendBalanceUpdate(
              updatedPortfolio._id,
              updatedPortfolio.balance,
              updatedPortfolio.compBalance
            );

            compBalance = newCompBalance;
            currentTime += 24 * 60 * 60 * 1000;
          }, dailyInterval);
        }
      }
    }

    res.status(200).render('dashboard', {
      title: 'Dashboard',
      portfolios,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the portfolios.');
  }
};

module.exports = { dashboard };
