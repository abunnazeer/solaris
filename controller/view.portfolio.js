const Portfolio = require('../models/portfolio/portfolio.model');
const BuyPortfolio = require('../models/portfolio/buyportfolio.model');

const Profile = require('../models/user/profile.model');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const axios = require('axios');

// const AppError = require('../utils/appError');

const getPortfolioForm = (req, res) => {
  res.status(200).render('portfolio/portfolioform', {
    title: 'Portfolio Form',
  });
};

// Render the edit form with the existing portfolio data
const getEditPortfolioForm = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.status(200).render('portfolio/portfolioedit', {
      title: 'Edit Portfolio',
      portfolio: portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

const fetchCryptoPrices = async (cryptocurrencies, targetCurrency) => {
  try {
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': '53e53396-66c2-41bc-8531-8b45d59eb2d9',
        },
        params: {
          symbol: cryptocurrencies.join(','),
          convert: targetCurrency,
        },
      }
    );
    return response; // Return the entire response
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {}; // Return an empty object on error
  }
};
// /////// PAYMENT VIEW/////////
const getPayment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const targetCurrency = 'USD';
  try {
    const portfolio = await BuyPortfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    const walletAddress = [
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        url: '/qr/btcoin.png',
        address: '1D9oZnNG6uLNCYpW1nxcz77dnvVyg8WuSR',
        price: portfolio.amount,
      },

      {
        name: 'Ethereum',
        symbol: 'ETH',
        url: '/qr/ethereum.png',
        address: '0xc59f6f9f34222f743d88d17edaea6fb80f7fc29e',
        price: portfolio.amount,
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        url: '/qr/usdt.png',
        address: 'TFd3j345JyAbZvZPzziRY9tQjFHth6ho8B',
        price: portfolio.amount,
      },
    ];
    const cryptocurrencies = walletAddress.map(crypto => crypto.symbol);

    const response = await fetchCryptoPrices(cryptocurrencies, targetCurrency);
    const cryptoPrices = response.data.data;

    const walletAddressWithPrices = walletAddress.map((crypto, id) => {
      const price =
        cryptoPrices[walletAddress[id].symbol].quote[targetCurrency].price;
      return { ...crypto, price };
    });

    const convertedAmounts = walletAddressWithPrices.map(crypto => {
      const cryptoAmount = (portfolio.amount / crypto.price).toFixed(6);
      return { ...crypto, cryptoAmount };
    });

    res.status(200).render('portfolio/user/payment', {
      title: 'Payment page',
      portfolio,
      cryptoDetails: convertedAmounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

const postBuyPortfolio = catchAsync(async (req, res) => {
  const { amount, payout, currency } = req.body;
  const { id } = req.params;
  let portfolio;

  try {
    portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
  const userId = req.user._id;
  const buyPortfolio = new BuyPortfolio({
    userId,
    amount,
    portfolioName: portfolio.title,
    payout,
    currency,
    _id: portfolio._id,
  });

  try {
    const savedPortfolio = await buyPortfolio.save();

    // Redirect to the active-portfolio page
    res.redirect(`/portfolio/payment/${savedPortfolio._id}`);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save portfolio' });
  }
});

// Fetches the buy portfolio form
const getBuyPortfolioForm = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // console.log(portfolio);
    res.render('portfolio/user/buyportfolio', {
      title: 'Buy Portfolio',
      portfolio: portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

const getPortfolioIndex = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default: page 1)
  const limit = 10; // Number of items per page
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  const portfolioCount = await Portfolio.countDocuments();
  const totalPages = Math.ceil(portfolioCount / limit);

  const portfolio = await Portfolio.find()
    .select('title')
    .skip(skip)
    .limit(limit);

  res.render('portfolio/portfolioindex', {
    title: 'Manage Portfolio',
    portfolio: portfolio,
    currentPage: page,
    totalPages: totalPages,
  });
});

const viewPortfolio = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.status(200).render('portfolio/portfoliodetail', {
      title: 'Portfolio Detail',
      portfolio: portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfoliox' });
  }
});

const updatePayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { walletAddress, cryptoAmount } = req.body;

  try {
    const portfolio = await BuyPortfolio.findByIdAndUpdate(
      id,
      { walletAddress, cryptoAmount }, // Update only the walletAddress and cryptoAmount fields
      { new: true }
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Get logged-in user email and name
    const { email } = req.user;

    // Get user profile
    const userProfile = await Profile.findOne({ user: req.user._id });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const { fullName } = userProfile;

    // Send email to the admin
    const adminMessage = `User with the following details has sent their payment.\n\nUser details:\nName: ${fullName}\nEmail: ${email}\n\nPayment details:\nAmount: ${portfolio.amount}\nCurrency: ${portfolio.currency}\nCrypto Amount: ${portfolio.cryptoAmount}\nPortfolio Name: ${portfolio.portfolioName}\nWallet Address: ${portfolio.walletAddress}`;
    await sendEmail({
      email: 'admin@solarisfinance.com', // Specify the admin's email address here
      subject: 'New Payment',
      message: adminMessage,
    });

    // Redirect to /user/user-investments
    res.redirect('/user/user-investments');
  } catch (error) {
    res.status(500).json({ message: 'Failed to update the payment' });
  }
});

module.exports = {
  getPortfolioForm,
  getPortfolioIndex,
  getEditPortfolioForm,
  viewPortfolio,
  getBuyPortfolioForm,
  postBuyPortfolio,
  getPayment,
  updatePayment,
};
