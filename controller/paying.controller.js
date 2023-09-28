
const BuyPortfolio = require('../models/portfolio/buyportfolio.model');
const Accounts = require('../models/user/accountDetails.model');
const PayoutConfig = require('../models/portfolio/payoutConfig.model');
const TransactionsActivity = require('../models/portfolio/transaction.model');
const AppError = require('../utils/appError');
const User = require('../models/user/user.model');

// const daysOfWeek = [
//   'Sunday',
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
// ];

// const dailyPayout = async () => {
//   const today = new Date();
//   const dayName = daysOfWeek[today.getDay()];

//   try {
//     if (
//       !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(
//         dayName
//       )
//     ) {
//       console.log('No daily payouts on weekends.');
//       return;
//     }

//     const portfolios = await BuyPortfolio.find({
//       status: 'active',
//       amount: { $gt: 0 },
//       payout: 'Daily Payout',
//     });

//     if (!portfolios || portfolios.length === 0) {
//       console.log('No portfolios found for daily payout.');
//       return;
//     }

//     let messages = [];

//     for (const portfolio of portfolios) {
//       const userId = portfolio.userId;

//       let accountDetail = await Accounts.findOne({ userId });

//       if (!accountDetail) {
//         accountDetail = new Accounts({
//           userId,
//           TotalCompoundingBalance: 0.0,
//           accumulatedDividends: 0.0,
//           totalAccountBalance: 0.0,
//           totalReferralBonus: 0.0,
//         });
//         await accountDetail.save();
//       }

//       const payout = parseFloat(
//         ((portfolio.dailyPercentage / 100) * portfolio.amount).toFixed(2)
//       );
//       portfolio.balance += payout;
//       await portfolio.save();

//       await Accounts.findByIdAndUpdate(
//         accountDetail._id,
//         {
//           $inc: {
//             totalAccountBalance: payout,
//             accumulatedDividends: payout,
//           },
//         },
//         { new: true }
//       );
//       function generateRandomNumber() {
//         const min = 10000;
//         const max = 99999;
//         return Math.floor(Math.random() * (max - min + 1)) + min;
//       }

//       const transActivity = new TransactionsActivity({
//         sn: generateRandomNumber(),
//         date: new Date(),
//         title: 'Daily Payout commission',
//         description: `Daily payout commission of $${payout.toLocaleString()} added to your account balance`,
//         buyPortfolioId: portfolio._id,
//         status: 'Credited',
//         amount: payout.toFixed(2),
//         userId,
//         method: 'USDT',
//         authCode: 0,
//       });

//       await transActivity.save();

//       messages.push(
//         `Payout of ${payout.toLocaleString()} added to balance for portfolio ${
//           portfolio._id
//         }`
//       );
//     }

//     console.log(messages.join('\n'));
//   } catch (err) {
//     console.error(err);
//     const error = new AppError('An error occurred', 500);
//     next(error);
//   }
// };

// const compoundingPayout = async () => {
//   const today = new Date();
//   const dayName = daysOfWeek[today.getDay()];

//   try {
//     if (
//       !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(
//         dayName
//       )
//     ) {
//       console.log('No compounding payouts on weekends.');
//       return;
//     }

//     const portfolios = await BuyPortfolio.find({
//       status: 'active',
//       amount: { $gt: 0 },
//       payout: '12 Month Compounding',
//     });

//     if (!portfolios || portfolios.length === 0) {
//       console.log('No portfolios found for compounding payout.');
//       return;
//     }

//     let messages = [];

//     const allUsers = await User.find(); // Fetch all users
//     const userMap = new Map(allUsers.map(user => [user._id.toString(), user]));

//     for (const portfolio of portfolios) {
//       const userId = portfolio.userId.toString();

//       if (userMap.has(userId)) {
//         // If userId exists in User document
//         let accountDetail = await Accounts.findOne({ userId });

//         if (!accountDetail) {
//           accountDetail = new Accounts({
//             userId,
//             TotalCompoundingBalance: 0.0,
//             accumulatedDividends: 0.0,
//             totalAccountBalance: 0.0,
//             totalReferralBonus: 0.0,
//           });
//           await accountDetail.save();
//         }

//         const payout = parseFloat(
//           ((portfolio.compPercentage / 100) * portfolio.amount).toFixed(2)
//         );

//         portfolio.amount += payout; // Increment amount by payout
//         portfolio.compBalance += payout; // Increment compBalance by payout
//         await portfolio.save();

//         await Accounts.findByIdAndUpdate(
//           accountDetail._id,
//           {
//             $inc: {
//               TotalCompoundingBalance: payout,
//               accumulatedDividends: payout,
//             },
//           },
//           { new: true }
//         );
//         function generateRandomNumber() {
//           const min = 10000;
//           const max = 99999;
//           return Math.floor(Math.random() * (max - min + 1)) + min;
//         }

//         const transActivity = new TransactionsActivity({
//           sn: generateRandomNumber(),
//           date: new Date(),
//           title: 'Compounding commission',
//           description: `Compounding commission of $${payout.toLocaleString()} added to your ${
//             portfolio.portfolioName
//           }`,
//           buyPortfolioId: portfolio._id,
//           status: 'Credited',
//           amount: payout.toFixed(2),
//           userId,
//           method: 'USDT',
//           authCode: 0,
//         });

//         await transActivity.save();
//         messages.push(
//           `Payout of ${payout.toLocaleString()} added to compounding balance for portfolio ${
//             portfolio._id
//           }`
//         );
//       }
//     }

//     console.log(messages.join('\n'));
//   } catch (err) {
//     console.error(err);
//     const error = new AppError('An error occurred', 500);
//     next(error);
//   }
// };

// Improved function to handle daily payout with expiry date
const dailyPayout = async next => {
  // Declare days of the week
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Get the current date
  const today = new Date();
  // Get the name of the current day
  const dayName = daysOfWeek[today.getDay()];

  try {
    // // Check if it's a weekend
    // if (['Saturday', 'Sunday'].includes(dayName)) {
    //   console.log('No daily payouts on weekends.');
    //   return;
    // }

    // Fetch active portfolios with daily payout
    let portfolios = await BuyPortfolio.find({
      status: 'active',
      amount: { $gt: 0 },
      payout: 'Daily Payout',
    });

    // Validate portfolios
    if (!portfolios || portfolios.length === 0) {
      console.log('No portfolios found for daily payout.');
      return;
    }

    // Initialize messages array
    let messages = [];

    // Loop through portfolios
    for (const portfolio of portfolios) {
      // Check if portfolio has expired
      if (portfolio.dateOfExpiry && new Date(portfolio.dateOfExpiry) < today) {
        console.log(`Portfolio ${portfolio._id} has expired. Skipping.`);
        continue;
      }

      // Get userId
      const userId = portfolio.userId;

      // Fetch or create account details
      let accountDetail = await Accounts.findOne({ userId });
      if (!accountDetail) {
        accountDetail = new Accounts({
          userId,
          TotalCompoundingBalance: 0.0,
          accumulatedDividends: 0.0,
          totalAccountBalance: 0.0,
          totalReferralBonus: 0.0,
        });
        await accountDetail.save();
      }

      // Calculate daily payout
      const payout = parseFloat(
        ((portfolio.dailyPercentage / 100) * portfolio.amount).toFixed(2)
      );

      // Update and save portfolio balance
      portfolio.balance += payout;
      await portfolio.save();

      // Update account details
      await Accounts.findByIdAndUpdate(
        accountDetail._id,
        {
          $inc: {
            totalAccountBalance: payout,
            accumulatedDividends: payout,
          },
        },
        { new: true }
      );

      // Generate random transaction number
      const generateRandomNumber = () => {
        const min = 10000;
        const max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      // Create and save transaction activity
      const transActivity = new TransactionsActivity({
        sn: generateRandomNumber(),
        date: new Date(),
        title: 'Daily Payout commission',
        description: `Daily payout commission of $${payout.toLocaleString()} added to your account balance`,
        buyPortfolioId: portfolio._id,
        status: 'Credited',
        amount: payout.toFixed(2),
        userId,
        method: 'USDT',
        authCode: 0,
      });

      await transActivity.save();

      // Add to messages
      messages.push(
        ` Daily Payout of ${payout.toLocaleString()} added to your account balance for portfolio ${
          portfolio._id
        }`
      );
    }

    // Log messages
    console.log(messages.join('\n'));
  } catch (err) {
    // Log and handle errors
    console.error(err);
    const error = new Error('An error occurred: ' + err.message);
    if (next) {
      next(error);
    }
  }
};

// Improved function to handle compounding payout with expiry date
const compoundingPayout = async next => {
  // Declare missing daysOfWeek array
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Get the current date
  const today = new Date();
  // Get the name of the current day
  const dayName = daysOfWeek[today.getDay()];

  try {
    // Validate dayName
    if (!daysOfWeek.includes(dayName)) {
      throw new Error('Invalid day name');
    }

    // // Check if it's a weekend
    // if (['Saturday', 'Sunday'].includes(dayName)) {
    //   console.log('No compounding payouts on weekends.');
    //   return;
    // }

    // Fetch active portfolios
    let portfolios;
    try {
      portfolios = await BuyPortfolio.find({
        status: 'active',
        amount: { $gt: 0 },
        payout: '12 Month Compounding',
      });
    } catch (err) {
      throw new Error('Error fetching portfolios: ' + err.message);
    }

    // Validate portfolios
    if (!portfolios || portfolios.length === 0) {
      console.log('No portfolios found for compounding payout.');
      return;
    }

    // Initialize messages array
    let messages = [];

    // Fetch all users
    let allUsers;
    try {
      allUsers = await User.find();
    } catch (err) {
      throw new Error('Error fetching users: ' + err.message);
    }

    // Map userId to user objects
    const userMap = new Map(allUsers.map(user => [user._id.toString(), user]));

    // Loop through portfolios
    for (const portfolio of portfolios) {
      // Convert userId to string
      const userId = portfolio.userId.toString();

      // Fetch or create account details
      let accountDetail = await Accounts.findOne({ userId });
      if (!accountDetail) {
        accountDetail = new Accounts({
          userId,
          TotalCompoundingBalance: 0.0,
          accumulatedDividends: 0.0,
          totalAccountBalance: 0.0,
          totalReferralBonus: 0.0,
        });
        await accountDetail.save();
      }

      // Check if portfolio has expired
      if (portfolio.dateOfExpiry && new Date(portfolio.dateOfExpiry) < today) {
        console.log(
          `Portfolio ${portfolio._id} has expired. Transferring funds.`
        );

        // Transfer funds from TotalCompoundingBalance to totalAccountBalance
        await Accounts.findByIdAndUpdate(
          accountDetail._id,
          {
            $inc: {
              totalAccountBalance: accountDetail.TotalCompoundingBalance,
            },
            $set: {
              TotalCompoundingBalance: 0.0,
            },
          },
          { new: true }
        );

        continue; // Skip to the next portfolio
      }

      // Check if userId exists
      if (userMap.has(userId)) {
        // Calculate payout
        const payout = parseFloat(
          ((portfolio.compPercentage / 100) * portfolio.amount).toFixed(2)
        );

        // Update and save portfolio
        portfolio.amount += payout;
        try {
          await portfolio.save();
        } catch (err) {
          throw new Error('Error saving portfolio: ' + err.message);
        }

        // Update account details
        try {
          await Accounts.findByIdAndUpdate(
            accountDetail._id,
            {
              $inc: {
                TotalCompoundingBalance: payout,
                accumulatedDividends: payout,
              },
            },
            { new: true }
          );
        } catch (err) {
          throw new Error('Error updating account details: ' + err.message);
        }

        // Generate random transaction number
        const generateRandomNumber = () => {
          const min = 10000;
          const max = 99999;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Create and save transaction activity
        const transActivity = new TransactionsActivity({
          sn: generateRandomNumber(),
          date: new Date(),
          title: 'Compounding commission',
          description: `Compounding commission of $${payout.toLocaleString()} added to your ${
            portfolio.portfolioName
          }`,
          buyPortfolioId: portfolio._id,
          status: 'Credited',
          amount: payout.toFixed(2),
          userId,
          method: 'USDT',
          authCode: 0,
        });

        try {
          await transActivity.save();
        } catch (err) {
          throw new Error('Error saving transaction activity: ' + err.message);
        }

        // Add to messages
        messages.push(
          `Compounding Payout of ${payout.toLocaleString()} added to compounding balance for portfolio ${
            portfolio._id
          }`
        );
      }
    }

    // Log messages
    console.log(messages.join('\n'));
  } catch (err) {
    // Log and handle errors
    console.error(err);
    const error = new Error('An error occurred: ' + err.message);
    if (next) {
      next(error);
    }
  }
};



module.exports = { dailyPayout, compoundingPayout };
