const Portfolio = require('../models/portfolio/portfolio.model');
const BuyPortfolio = require('../models/portfolio/buyportfolio.model');
const User = require('../models/user/user.model');
const Transactions = require('../models/portfolio/transaction.model');
const Referralbonus = require('../models/user/referralBonus.model');
const PayoutConfig = require('../models/portfolio/payoutConfig.model');

const Profile = require('../models/user/profile.model');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const axios = require('axios');
const { Plisio } = require('@plisio/api-client');
const ReferralConfig = require('../models/user/referralConfig.model');

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
        name: 'BTC',
        symbol: 'BTC',
        url: '/qr/btc.jpeg',
        address: '35fzCfP2rZAUmWyGXUUiBgFBRBarSBBZas',
        price: portfolio.amount,
      },

      {
        name: 'ETH',
        symbol: 'ETH',
        url: '/qr/eth.jpeg',
        address: '0x457f18b10467340db29c7e72581e5d4650928d78',
        price: portfolio.amount,
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        url: '/qr/usdt.jpeg',
        address: 'TLyFun55QXxxk8qqtfhwG2wvfhpN1Poh4M',
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
      const cryptoAmount = (portfolio.depositAmount / crypto.price).toFixed(6);
      return { ...crypto, cryptoAmount };
    });

    res.status(200).render('portfolio/user/payment', {
      title: 'Payment page',
      portfolio,
      cryptoDetails: convertedAmounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to buy portfolio' });
  }
});
const postBuyPortfolio = catchAsync(async (req, res) => {
  const { depositAmount, payout, currency } = req.body;
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

  const buyPortfolio = new BuyPortfolio({
    userId,
    depositAmount,
    portfolioName: portfolio.portfolioTitle,
    payout,
    currency,
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

const paymentComfirmation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, dateOfPurchase, dateOfExpiry } = req.body;

  try {
    const portfoliodetail = await BuyPortfolio.findById(id);

    if (!portfoliodetail) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    const allReferral = await ReferralConfig.find();
    const userId = portfoliodetail.userId;
    const userDetail = await User.findOne({ _id: userId });

    const buyPortfolio = await BuyPortfolio.findByIdAndUpdate(
      id,
      {
        amount: portfoliodetail.depositAmount,
        status,
        depositAmount: 0,
        dateOfPurchase,
        dateOfExpiry,
      },
      { new: true }
    );

    // If the user was referred by someone, create a Referralbonus
    if (userDetail.referredBy) {
      const referringUserId = userDetail.referredBy;
      const bonusAmount =
        portfoliodetail.depositAmount * allReferral.firstLevel; // 10% of depositAmount

      const { _id } = await User.findOne({ _id: userId });
      const userProfile = await Profile.findOne({ _id: userId });
      const description = `Credited 10% $${bonusAmount}, as a referral from ${userProfile.fullName} to your ${portfoliodetail.payout} Wallet `;

      const referralBonus = new Referralbonus({
        referringUserId, // The user who referred the current user
        bonusAmount,
        referredUserId: _id, // The current user who was referred
        description: description,
      });

      // Save it without validation
      await referralBonus.save({ validateBeforeSave: false });

      // Check if the referring user has a referrer (second-level referrer)
      const referringUser = await User.findOne({ _id: referringUserId });

      if (referringUser && referringUser.referredBy) {
        const secondLevelReferrerId = referringUser.referredBy;
        const secondLevelBonusAmount =
          portfoliodetail.depositAmount * allReferral.secondLevel; // 5% of depositAmount

        const { _id: secondLevelReferrerUserId } = await User.findOne({
          _id: referringUserId,
        });
        const userProfile = await Profile.findOne({ _id: userId });
        const description = `Credited 5% $${bonusAmount}, as a referral from ${userProfile.fullName} to your ${portfoliodetail.payout} Wallet `;
        const secondLevelReferralBonus = new Referralbonus({
          referringUserId: secondLevelReferrerId, // The user who referred the referring user
          bonusAmount: secondLevelBonusAmount,
          referredUserId: secondLevelReferrerUserId, // The referring user who was referred
          description: description,
        });

        // Save it without validation
        await secondLevelReferralBonus.save({ validateBeforeSave: false });

        // Check if the second-level referrer has a referrer (third-level referrer)
        const secondLevelReferrerUser = await User.findOne({
          _id: secondLevelReferrerId,
        });

        if (secondLevelReferrerUser && secondLevelReferrerUser.referredBy) {
          const thirdLevelReferrerId = secondLevelReferrerUser.referredBy;
          const thirdLevelBonusAmount =
            portfoliodetail.depositAmount * allReferral.thirdLevel; // 2.5% of depositAmount

          const { _id: thirdLevelReferrerUserId } = await User.findOne({
            _id: secondLevelReferrerId,
          });
          const userProfile = await Profile.findOne({ _id: userId });
          const description = `Credited 5% $${bonusAmount}, as a referral from ${userProfile.fullName} to your ${portfoliodetail.payout} Wallet `;
          const thirdLevelReferralBonus = new Referralbonus({
            referringUserId: thirdLevelReferrerId, // The user who referred the second-level referrer
            bonusAmount: thirdLevelBonusAmount,
            referredUserId: thirdLevelReferrerUserId, // The second-level referrer who was referred
            description: description,
          });

          // Save it without validation
          await thirdLevelReferralBonus.save({ validateBeforeSave: false });
        }
      }
    }

    if (!buyPortfolio) {
      return res.status(404).json({ message: 'BuyPortfolio not found' });
    }

    const emailContent = `Your payment for ${portfoliodetail.portfolioName} has been confirmed, and your portfolio has been activated`;

    // Send email to the user
    await sendEmail({
      email: userDetail.email,
      subject: 'Payment confirmed, Portfolio Activation successful',
      message: emailContent,
    });

    return res.json({
      message: 'Status updated successfully',
      portfolio: buyPortfolio,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update status' });
  }
});

// const getBuyPortfolioForm = catchAsync(async (req, res) => {
//   const { id } = req.params;

//   try {
//     const portfolio = await Portfolio.findById(id);

//     if (!portfolio) {
//       return res
//         .status(404)
//         .render('response/status', { message: 'Portfolio not found' });
//     }
//     const allPayouts = await PayoutConfig.find();
//     const minimumCapital = Number(
//       portfolio.minimumCapital.replace(/[\$,]/g, '').trim()
//     );

//     res.render('portfolio/user/buyportfolio', {
//       title: 'Buy Portfolio',
//       portfolio,
//       minimumCapital: minimumCapital,
//       payouts: allPayouts,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .render('response/status', { message: 'Failed to fetch portfolio' });
//   }
// });

const getBuyPortfolioForm = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res
        .status(404)
        .render('response/status', { message: 'Portfolio not found' });
    }

    const allPayouts = await PayoutConfig.find();
    const minimumCapital = Number(
      portfolio.minimumCapital.replace(/[\$,]/g, '').trim()
    );

    res.render('portfolio/user/buyportfolio', {
      title: 'Buy Portfolio',
      portfolio,
      minimumCapital: minimumCapital,
      payouts: allPayouts,
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
    .select('sn portfolioTitle') // Include 'sn' and 'portfolioTitle' fields
    .sort({ sn: 1 }) // Sort portfolios by 'sn' field in ascending order
    .skip(skip)
    .limit(limit);

  res.render('portfolio/portfolioindex', {
    title: 'Manage Portfolio',
    portfolio: portfolio,
    currentPage: page,
    totalPages: totalPages,
  });
});

const getStatusIndex = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default: page 1)
  const limit = 10; // Number of items per page
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  const buyPortfolioCount = await BuyPortfolio.countDocuments();
  const totalPages = Math.ceil(buyPortfolioCount / limit);

  const userDetails = await BuyPortfolio.find()
    .skip(skip)
    .limit(limit)
    .populate('userId') // Populate the 'userId' field to retrieve the associated user data
    .exec();

  const userObjects = []; // Create an array to store the userObjects

  for (const user of userDetails) {
    const userId = user.userId._id;
    const userProfile = await Profile.findOne({ _id: userId });

    if (!userProfile) {
      return res
        .status(404)
        .render('response/status', { message: 'User profile not found' });
    }

    const userObject = {
      userDetails: user,
      userProfile: userProfile,
    };

    userObjects.push(userObject); // Push the userObject to the array
  }

  // console.log(userObjects);
  res.render('portfolio/statusindex', {
    title: 'Portfolio Status',
    userObjects,
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

const updatePayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { walletAddress, cryptoAmount } = req.body;

  try {
    const portfolio = await BuyPortfolio.findByIdAndUpdate(
      id,
      { walletAddress, cryptoAmount },
      { new: true }
    );

    if (!portfolio) {
      return res
        .status(404)
        .render('response/status', { message: 'Payment not found' });
    }

    function generateRandomNumber() {
      const min = 10000;
      const max = 99999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const date = new Date();

    const statusValue = id ? 'Deposit' : 'Approved'; // Adjust this condition as needed

    const transActivity = new Transactions({
      sn: generateRandomNumber(),
      date: date,
      title: portfolio.payout,
      description: `Deposit of $${portfolio.depositAmount} made for ${portfolio.portfolioName}`,
      buyPortfolioId: id,
      status: statusValue,
      amount: portfolio.depositAmount,
      userId: id,
      method: portfolio.currency,
      authCode: 0,
    });

    transActivity.validate(function (error) {
      if (error) {
        console.error('Validation error:', error);
        return res
          .status(400)
          .render('response/status', { message: 'Validation error' });
      }

      transActivity.save({ runValidators: true }, function (error) {
        if (error) {
          console.error('Save error:', error);
          return res.status(500).render('response/status', {
            message: 'Failed to save the document',
          });
        }

        return res.status(200).render('response/status', {
          message: 'You have successfully sent your payment.',
        });
      });
    });

    if (!req.user) {
      return res
        .status(404)
        .render('response/status', { message: 'User not found' });
    }

    const { email } = req.user;

    const userProfile = await Profile.findOne({ user: req.user._id });

    if (!userProfile) {
      return res
        .status(404)
        .render('response/status', { message: 'User profile not found' });
    }

    const { fullName } = userProfile;

    const adminMessage = `User with the following details has sent their payment.\n\nUser details:\nName: ${fullName}\nEmail: ${email}\n\nPayment details:\nAmount: ${portfolio.depositAmount}\nCurrency: ${portfolio.currency}\nCrypto Amount: ${portfolio.cryptoAmount}\nPortfolio Name: ${portfolio.portfolioName}\nWallet Address: ${portfolio.walletAddress}`;
    await sendEmail({
      email: 'admin@solarisfinance.com',
      subject: 'New Payment',
      message: adminMessage,
    });

    return res.status(200).render('response/status', {
      message:
        'You have sent your payment. Your portfolio will be activated after payment has been confirmed',
    });
  } catch (error) {
    console.error('Failed to update the payment:', error);
    return res
      .status(500)
      .render('response/status', { message: 'Failed to update the payment' });
  }
});


// const updatePayment = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const { walletAddress, cryptoAmount } = req.body;

//   try {
//     const portfolio = await BuyPortfolio.findByIdAndUpdate(
//       id,
//       { walletAddress, cryptoAmount }, // Update only the walletAddress and cryptoAmount fields
//       { new: true }
//     );

//     if (!portfolio) {
//       return res
//         .status(404)
//         .render('response/status', { message: 'Payment not found' });
//     }

//     // 1. Generate a serial number and assign it to `sn`
//     function generateRandomNumber() {
//       const min = 10000;
//       const max = 99999;
//       return Math.floor(Math.random() * (max - min + 1)) + min;
//     }

//     // 2. Get the current date and assign it to `date`
//     const date = new Date();

//     const transActivity = new Transactions({
//       sn: generateRandomNumber(),
//       date: date,
//       title: portfolio.payout,
//       description: `Deposit of $${portfolio.depositAmount} made for ${portfolio.portfolioName}`,
//       buyPortfolioId: id,
//       status: id ? 'Deposit' : 'Approved',
//       amount: portfolio.depositAmount,
//       userId: id,
//       method: portfolio.currency, // Replace 'paymentMethod' with the actual payment method value
//       authCode: 0,
//     });

//     transActivity.validate(function (error) {
//       if (error) {
//         console.error('Validation error:', error);
//         return res
//           .status(400)
//           .render('response/status', { message: 'Validation error' });
//       }

//       transActivity.save({ runValidators: true }, function (error) {
//         if (error) {
//           console.error('Save error:', error);
//           return res.status(500).render('response/status', {
//             message: 'Failed to save the document',
//           });
//         }

//         return res.status(200).render('response/status', {
//           message: 'You have successfully sent your payment.',
//         });
//       });
//     });

//     // Get logged-in user email and name
//     const { email } = req.user;

//     // Get user profile
//     const userProfile = await Profile.findOne({ user: req.user._id });

//     if (!userProfile) {
//       return res
//         .status(404)
//         .render('response/status', { message: 'User profile not found' });
//     }

//     const { fullName } = userProfile;

//     // Send email to the admin
//     const adminMessage = `User with the following details has sent their payment.\n\nUser details:\nName: ${fullName}\nEmail: ${email}\n\nPayment details:\nAmount: ${portfolio.amount}\nCurrency: ${portfolio.currency}\nCrypto Amount: ${portfolio.cryptoAmount}\nPortfolio Name: ${portfolio.portfolioName}\nWallet Address: ${portfolio.walletAddress}`;
//     await sendEmail({
//       email: 'admin@solarisfinance.com', // Specify the admin's email address here
//       subject: 'New Payment',
//       message: adminMessage,
//     });

//     return res.status(200).render('response/status', {
//       message:
//         'You have sent your payment. Your portfolio will be activated after payment has been confirmed',
//     });
//   } catch (error) {
//     console.error('Failed to update the payment:', error);
//     return res
//       .status(500)
//       .render('response/status', { message: 'Failed to update the payment' });
//   }
// });

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
  paymentComfirmation,
};
