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
  '84aaoal2XcwHDHgZe2TfgtbPVUXbX-IqBWTFwAsf2uKkbgNSTbrOgR7ikq_KsrrP';

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

function generateOrderNumber() {
  const randomNumber = Math.floor(Math.random() * 100000000);
  const paddedNumber = randomNumber.toString().padStart(8, '0');
  return paddedNumber;
}

const getPayment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const protocol = req.protocol;
  const host = req.get('host');
  const successUrl = `${protocol}://${host}/portfolio/payment-completed`;
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
    callback_url: 'http://test.com/callback',
    success_callback_url: successUrl,
    api_key: secretKey,
    redirect_to_invoice: true,
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

    res.redirect(invoice_url); // Perform the redirect to the invoice URL
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while generating invoice.');
  }
});

// payment successful

const paymentSucceeded = catchAsync(async (req, res) => {
  const { id, sum } = req.params;

  const portfolio = await BuyPortfolio.findOne({ walletAddress: id });

  if (portfolio) {
    portfolio.status = 'active';
    portfolio.portfolioCryptoAmount = sum;
    await portfolio.save();
  }

  // Add any additional logic or response handling as needed

  res.status(200).send('Payment succeeded');
});

// const postBuyPortfolio = catchAsync(async (req, res) => {
//   const { amount, payout, currency } = req.body;
//   const { id } = req.params;
//   let portfolio;

//   try {
//     portfolio = await Portfolio.findById(id);

//     if (!portfolio) {
//       return res.status(404).json({ message: 'Portfolio not found' });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: 'Failed to fetch portfolio' });
//   }

//   const userId = req.user._id;

//   // Check if a BuyPortfolio instance already exists for the given userId and portfolioId
//   const existingBuyPortfolio = await BuyPortfolio.findOne({
//     userId,
//     _id: portfolio._id,
//   });

//   if (existingBuyPortfolio) {
//     // Update the status field of the existing BuyPortfolio instance
//     existingBuyPortfolio.status =
//       existingBuyPortfolio.status === 'active' ? 'inactive' : 'active';

//     try {
//       const updatedPortfolio = await existingBuyPortfolio.save();

//       return res.json({
//         message: 'Status updated successfully',
//         portfolio: updatedPortfolio,
//       });
//     } catch (error) {
//       return res.status(500).json({ message: 'Failed to update status' });
//     }
//   } else {
//     // Create a new BuyPortfolio instance
//     const currentDate = new Date();
//     const dateOfExpiry = new Date(currentDate);
//     dateOfExpiry.setMonth(dateOfExpiry.getMonth() + 12);

//     const buyPortfolio = new BuyPortfolio({
//       userId,
//       amount,
//       portfolioName: portfolio.portfolioTitle,
//       payout,
//       currency,
//       _id: portfolio._id,
//       dateOfPurchase: currentDate,
//       dateOfExpiry: dateOfExpiry,
//     });
//     console.log(id);
//     console.log(userId);

//     try {
//       const savedPortfolio = await buyPortfolio.save();

//       // Redirect to the active-portfolio page
//       return res.redirect(`/portfolio/payment/${savedPortfolio._id}`);
//     } catch (error) {
//       return res.status(500).json({ message: 'Failed to save  the portfolio' });
//     }
//   }
// });

// Fetches the buy portfolio form

// const postBuyPortfolio = catchAsync(async (req, res) => {
//   const { amount, payout, currency } = req.body;
//   const { id } = req.params;
//   let portfolio;

//   try {
//     portfolio = await Portfolio.findById(id);

//     if (!portfolio) {
//       return res.status(404).json({ message: 'Portfolio not found' });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: 'Failed to fetch portfolio' });
//   }

//   const userId = req.user._id;

//   // Check if a BuyPortfolio instance already exists for the given userId and portfolioId
//   const existingBuyPortfolio = await BuyPortfolio.findOne({
//     userId,
//     _id: portfolio._id,
//   });

//   if (existingBuyPortfolio) {
//     // Update the status field of the existing BuyPortfolio instance
//     existingBuyPortfolio.status =
//       existingBuyPortfolio.status === 'active' ? 'inactive' : 'active';

//     try {
//       const updatedPortfolio = await existingBuyPortfolio.save();

//       return res.json({
//         message: 'Status updated successfully',
//         portfolio: updatedPortfolio,
//       });
//     } catch (error) {
//       return res.status(500).json({ message: 'Failed to update status' });
//     }
//   } else {
//     // Check if the user id exists in any BuyPortfolio instance
//     const userBuyPortfolio = await BuyPortfolio.findOne({ userId });

//     if (userBuyPortfolio) {
//       return res
//         .status(400)
//         .json({ message: 'User already has a BuyPortfolio' });
//     }

//     // Create a new BuyPortfolio instance
//     const currentDate = new Date();
//     const dateOfExpiry = new Date(currentDate);
//     dateOfExpiry.setMonth(dateOfExpiry.getMonth() + 12);

//     const buyPortfolio = new BuyPortfolio({
//       userId,
//       amount,
//       portfolioName: portfolio.portfolioTitle,
//       payout,
//       currency,
//       _id: portfolio._id,
//       dateOfPurchase: currentDate,
//       dateOfExpiry: dateOfExpiry,
//     });

//     try {
//       const savedPortfolio = await buyPortfolio.save();

//       // Redirect to the active-portfolio page
//       return res.redirect(`/portfolio/payment/${savedPortfolio._id}`);
//     } catch (error) {
//       return res.status(500).json({ message: 'Failed to save the portfolio' });
//     }
//   }
// });

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
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch portfolio' });
  }

  const userId = req.user._id;

  // Check if a BuyPortfolio instance already exists for the given userId and portfolioId
  const existingBuyPortfolio = await BuyPortfolio.findOne({
    userId,
    _id: portfolio._id,
  });

  if (existingBuyPortfolio) {
    // Update the status field of the existing BuyPortfolio instance
    existingBuyPortfolio.status =
      existingBuyPortfolio.status === 'active' ? 'inactive' : 'active';

    try {
      const updatedPortfolio = await existingBuyPortfolio.save();

      return res.json({
        message: 'Status updated successfully',
        portfolio: updatedPortfolio,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update status' });
    }
  } else {
    // Check if the user id exists in any BuyPortfolio instance
    const userBuyPortfolio = await BuyPortfolio.findOne({ userId });

    if (userBuyPortfolio) {
      return res
        .status(400)
        .json({ message: 'User already has a BuyPortfolio' });
    }

    // Create a new BuyPortfolio instance
    const currentDate = new Date();
    const dateOfExpiry = new Date(currentDate);
    dateOfExpiry.setMonth(dateOfExpiry.getMonth() + 12);

    const buyPortfolio = new BuyPortfolio({
      userId,
      amount,
      portfolioName: portfolio.portfolioTitle,
      payout,
      currency,
      // _id: portfolio._id,
      dateOfPurchase: currentDate,
      dateOfExpiry: dateOfExpiry,
    });

    try {
      const savedPortfolio = await buyPortfolio.save();

      // Redirect to the active-portfolio page
      return res.redirect(`/portfolio/payment/${savedPortfolio._id}`);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to save the portfolio' });
    }
  }
});

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
      return res.status(404).json({ message: 'Portfolio not found' });
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
    res.status(500).json({ message: 'Failed to fetch portfolio' });
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
  getStatusIndex,
  paymentSucceeded,
};
