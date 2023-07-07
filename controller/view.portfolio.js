const Portfolio = require('../models/portfolio/portfolio.model');
const BuyPortfolio = require('../models/portfolio/buyportfolio.model');
const User = require('../models/user/user.model');

const Profile = require('../models/user/profile.model');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const axios = require('axios');
const { Plisio } = require('@plisio/api-client');
// const AppError = require('../utils/appError');
const secretKey =
  '6C0-0DVUxLblgkhe7ViRCGI1DslhOjErhaoeuWkLRTrm4cIHEqwkHhSOkN9ywVhj';
// const secretKey =
//   '84aaoal2XcwHDHgZe2TfgtbPVUXbX-IqBWTFwAsf2uKkbgNSTbrOgR7ikq_KsrrP';

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
      return res
        .status(404)
        .render('response/status', { message: 'Portfolio not found' });
    }

    res.status(200).render('portfolio/portfolioedit', {
      title: 'Edit Portfolio',
      portfolio: portfolio,
    });
  } catch (error) {
    res
      .status(500)
      .render('response/status', { message: 'Failed to fetch portfolio' });
  }
});

function generateOrderNumber() {
  const randomNumber = Math.floor(Math.random() * 100000000);
  const paddedNumber = randomNumber.toString().padStart(8, '0');
  return paddedNumber;
}

const getPayment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const protocol = req.protocol;
  const host = req.get('host');
  const successUrl = `${protocol}://${host}/portfolio/payment-completed?json=true`;
  const portfolio = await BuyPortfolio.findById(id);
  const { userId } = portfolio;
  const user = await User.findOne({ _id: userId });
  const url = 'https://plisio.net/api/v1/invoices/new';

  const params = {
    source_currency: 'USD',
    source_amount: portfolio.amount,
    order_number: generateOrderNumber(),
    currency: portfolio.currency,
    email: user.email,
    order_name: portfolio.portfolioName,
    callback_url: true,
    success_callback_url: true,
    fail_callback_url: true,
    api_key: secretKey,
  };

  const config = {
    params,
    maxRedirects: 0, // Disable Axios redirect handling
    validateStatus: status => status >= 200 && status < 303,
    headers: {
      'User-Agent': req.headers['user-agent'],
    },
  };

  try {
    const response = await axios.get(url, config);
    const { invoice_url, txn_id } = response.data.data;

    // Update portfolio.walletAddress with the txn_id before redirecting
    portfolio.walletAddress = txn_id;
    await portfolio.save();

    // Perform the redirect to the invoice URL
    return res.redirect(303, invoice_url);
  } catch (error) {
    console.error(error);
    res.status(500).render('response/status', {
      message: 'An error occurred while generating invoice.',
    });
  }
});

const paymentSucceeded = catchAsync(async (req, res) => {
  // const { id, sum } = req.params;

  // Example code to parse the JSON response
  const paymentData = req.body;
  console.log(paymentData);

  const portfolio = await BuyPortfolio.findOne({
    walletAddress: paymentData.txn_id,
  });
  console.log(portfolio);
  if (portfolio) {
    portfolio.status = 'active';
    portfolio.portfolioCryptoAmount = sum;
    await portfolio.save();
  }

  // Add any additional logic or response handling as needed

  res.status(200).send('Payment succeeded');
});

const postBuyPortfolio = catchAsync(async (req, res) => {
  const { amount, payout, currency } = req.body;
  const { id } = req.params;

  let portfolio;
  try {
    portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res
        .status(404)
        .render('response/status', { message: 'Portfolio not found' });
    }
  } catch (error) {
    return res
      .status(500)
      .render('response/status', { message: 'Failed to fetch portfolio' });
  }

  const userId = req.user._id;

  const currentDate = new Date();
  const dateOfExpiry = new Date(currentDate);
  dateOfExpiry.setMonth(dateOfExpiry.getMonth() + 12);

  const buyPortfolio = new BuyPortfolio({
    userId,
    amount,
    portfolioName: portfolio.portfolioTitle,
    payout,
    currency,
    dateOfPurchase: currentDate,
    dateOfExpiry,
  });

  try {
    const savedPortfolio = await buyPortfolio.save();

    return res.redirect(`/portfolio/payment/${savedPortfolio._id}`);
  } catch (error) {
    return res
      .status(500)
      .render('response/status', { message: 'Failed to save the portfolio' });
  }
});

const getBuyPortfolioForm = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res
        .status(404)
        .render('response/status', { message: 'Portfolio not found' });
    }

    // console.log(portfolio);
    res.render('portfolio/user/buyportfolio', {
      title: 'Buy Portfolio',
      portfolio: portfolio,
    });
  } catch (error) {
    res
      .status(500)
      .render('response/status', { message: 'Failed to fetch portfolio' });
  }
});

const getPortfolioIndex = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default: page 1)
  const limit = 10; // Number of items per page
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  const portfolioCount = await Portfolio.countDocuments();
  const totalPages = Math.ceil(portfolioCount / limit);

  const portfolio = await Portfolio.find()
    .select('portfolioTitle')
    .skip(skip)
    .limit(limit);

  res.render('portfolio/portfolioindex', {
    title: 'Manage Portfolio',
    portfolio: portfolio,
    currentPage: page,
    totalPages: totalPages,
  });
});

// PORTFOLIO STATUS

const getStatusIndex = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default: page 1)
  const limit = 10; // Number of items per page
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  const buyPortfolioCount = await BuyPortfolio.countDocuments();
  const totalPages = Math.ceil(buyPortfolioCount / limit);

  const userDetails = await BuyPortfolio.find()
    .skip(skip)
    .limit(limit)
    .populate('userId') // Populate the 'user' field to retrieve the associated user data
    .exec();
  console.log(userDetails);
  res.render('portfolio/statusindex', {
    title: 'Portfolio Status',
    userDetails: userDetails,
    currentPage: page,
    totalPages: totalPages,
  });
});

const viewPortfolio = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res
        .status(404)
        .render('response/status', { message: 'Portfolio not found' });
    }

    const buyPortfolio = await BuyPortfolio.findOne({ _id: id });

    const user = req.user;

    res.status(200).render('portfolio/portfoliodetail', {
      title: 'Portfolio Detail',
      portfolio,
      user,
      buyPortfolio,
    });
  } catch (error) {
    res
      .status(500)
      .render('response/status', { message: 'Failed to fetch portfolio' });
  }
});

// //////////////////////// UPDATE PAYMENT
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
      return res
        .status(404)
        .render('response/status', { message: 'Payment not found' });
    }

    // Get logged-in user email and name
    const { email } = req.user;

    // Get user profile
    const userProfile = await Profile.findOne({ user: req.user._id });

    if (!userProfile) {
      return res
        .status(404)
        .render('response/status', { message: 'User profile not found' });
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
    res
      .status(500)
      .render('response/status', { message: 'Failed to update the payment' });
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
  getStatusIndex,
  paymentSucceeded,
};
