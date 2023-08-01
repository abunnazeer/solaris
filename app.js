const express = require('express');
// const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Importing routers
const Transactions = require('./models/portfolio/transaction.model');
const Portfolio = require('./models/portfolio/portfolio.model');
const buyPortfolio = require('./models/portfolio/buyportfolio.model');
const userRouter = require('./routes/user.routers');
const portfolioRouter = require('./routes/portfolio.routers');
const activity = require('./routes/activity.routers');
const referral = require('./routes/referral.routers');
const { protect } = require('./controller/auth.controller');
const config = require('./routes/config.router');
const globalErrorHandler = require('./controller/error.controller');
const AppError = require('./utils/appError');

const app = express();

// Middleware setup

// app.use(helmet()); // Set security HTTP Headers
// app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '10kb' })); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(mongoSanitize()); // Data sanitization against NoSQL Injection
// app.use(xss()); // Data sanitization against XSS

// Load development middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging for development environment
}

// Rate limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too Many Requests from this IP, please try again in an hour!',
});
// function updateCSP(req, res, next) {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src 'self' https://conoret.com"
//   );
//   next();
// }

app.use('/login', limiter);

// Set view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function (req, res, next) {
  // Check if the requested URL ends with '.map' or '.woff2'
  if (req.url.endsWith('.map') || req.url.endsWith('.woff2')) {
    // If it ends with '.map' or '.woff2', respond with a 404 error
    return res.status(404).send('Not found');
  }
  next();
});

// Connect to the database
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Successful!');
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
  });

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: DB,
      ttl: 7 * 24 * 60 * 60,
    }),
  })
);
// app.use(updateCSP);
// Import and use routers
app.use('/user', userRouter);
app.use('/portfolio', portfolioRouter);
app.use('/user', activity);
app.use('/user', referral);
app.use('/user', config);

// Error handling middleware
app.use(globalErrorHandler);

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('chat message', msg => {
    console.log('Message:', msg);
    io.emit('chat message', msg);
  });

  socket.on('balanceUpdate', message => {
    // console.log('Balance Update:', message);
    // Parse the message and update the dashboard accordingly
    const { portfolioId, balance, compBalance } = JSON.parse(message);
    // Update the dashboard with the new balance values
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

function sendBalanceUpdate(portfolioId, balance, compBalance) {
  const message = JSON.stringify({ portfolioId, balance, compBalance });
  io.emit('balanceUpdate', message);
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
    let incrementValue;
    if (portfolio.payout === 'compounding') {
      incrementValue = dailyPercentage * portfolio.amount;
      newBalance = compBalance + incrementValue;
    } else {
      incrementValue = dailyPercentage * portfolio.amount;
      newBalance = balance + incrementValue;
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

    // Generate a serial number
    const sn = generateRandomNumber();

    // Get the current date
    const date = new Date();

    const transActivity = new Transactions({
      sn: sn,
      date: date,
      title: portfolio.payout,
      description: `Credit of $${incrementValue} made for ${portfolio.portfolioName}`,
      buyPortfolioId: portfolio.userId,
      status: portfolio.userId ? 'Credited' : 'Approved',
      amount: incrementValue,
      userId: portfolio.userId,
      method: portfolio.currency,
      authCode: 0,
    });

    try {
      // Save the transactions activity document without validation
      await transActivity.save({ validateBeforeSave: false });
    } catch (error) {
      console.error('Failed to save the document:', error);
      return res.status(500).render('response/status', {
        message: 'Failed to save the document',
      });
    }

    sendBalanceUpdate(
      updatedPortfolio._id,
      updatedPortfolio.balance,
      updatedPortfolio.compBalance
    );

    // console.log('Updated Portfolio:', updatedPortfolio);

    if (portfolio.payout === 'compounding') {
      compBalance = newBalance;
    } else {
      balance = newBalance;
    }

    currentTime += millisecondsInDay;
  }, dailyInterval);
};

// Function to generate a random number between 10000 and 99999
function generateRandomNumber() {
  const min = 10000;
  const max = 99999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// // Dashboard route
// app.get('/dashboard', protect, async (req, res) => {
//   try {
//     const user = req.user.id;
//     const portfolios = await buyPortfolio.find({ userId: user });

//     for (const portfolio of portfolios) {
//       if (
//         portfolio.payout === portfolio.payoutName[portfolio.payout] &&
//         portfolio.payout !== 'compounding' &&
//         portfolio.status === 'active'
//       ) {
//         const dailyInterval = portfolio.portConfig[portfolio.payout];
//         if (dailyInterval > 0) {
//           updatePortfolio(
//             portfolio,
//             portfolio.dailyPercentage,
//             24 * 60 * 60 * 1000,
//             dailyInterval
//           );
//         }
//       }

//       if (
//         portfolio.payout === portfolio.payoutName['compounding'] &&
//         portfolio.payout !== 'daily' &&
//         portfolio.status === 'active'
//       ) {
//         const dailyInterval = portfolio.portConfig[portfolio.payout];
//         if (dailyInterval > 0) {
//           let compBalance = portfolio.compBalance;
//           let currentTime = Date.parse(portfolio.dateOfPurchase);
//           const terminationTime = Date.parse(portfolio.dateOfExpiry);
//           const intervalId = setInterval(async () => {
//             if (portfolio.status === 'inactive') {
//               clearInterval(intervalId);
//               return;
//             }
//             if (currentTime >= terminationTime) {
//               clearInterval(intervalId);
//               await buyPortfolio.findByIdAndUpdate(portfolio._id, {
//                 status: 'inactive',
//               });
//               return;
//             }
//             const newCompBalance =
//               compBalance + portfolio.compPercentage * portfolio.amount;

//             const updatedPortfolio = await buyPortfolio.findByIdAndUpdate(
//               portfolio._id,
//               {
//                 compBalance: newCompBalance,
//                 compAmount: newCompBalance + portfolio.amount,
//               },
//               { new: true }
//             );

//             sendBalanceUpdate(
//               updatedPortfolio._id,
//               updatedPortfolio.balance,
//               updatedPortfolio.compBalance
//             );

//             console.log('Updated Portfolio:', updatedPortfolio);

//             compBalance = newCompBalance;
//             currentTime += 24 * 60 * 60 * 1000;
//           }, dailyInterval);
//         }
//       }
//     }

//     res.status(200).render('dashboard', {
//       title: 'Dashboard',
//       portfolios,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('An error occurred while fetching the portfolios.');
//   }
// });

// Dashboard route
// Dashboard route
// Dashboard route
app.get('/dashboard', protect, async (req, res) => {
  try {
    const user = req.user.id;
    const portfolios = await buyPortfolio.find({ userId: user });

    for (const portfolio of portfolios) {
      if (
        portfolio.payout === portfolio.payoutName[portfolio.payout] &&
        portfolio.payout !== 'compounding' &&
        portfolio.status === 'active'
      ) {
        const dailyInterval = 60 * 1000; // 1 minute interval
        updatePortfolio(
          portfolio,
          portfolio.dailyPercentage,
          24 * 60 * 60 * 1000,
          dailyInterval
        );
      }

      if (
        portfolio.payout === portfolio.payoutName['compounding'] &&
        portfolio.payout !== 'daily' &&
        portfolio.status === 'active'
      ) {
        const dailyInterval = 60 * 1000; // 1 minute interval
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
            compBalance + Portfolio.cPercentage * portfolio.amount;

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

          // console.log('Updated Portfolio:', updatedPortfolio);

          compBalance = newCompBalance;
          currentTime += 60 * 1000; // Increment currentTime by 1 minute
        }, dailyInterval);
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
});

// Handle all other routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Configure the server port
const PORT = process.env.PORT || 9000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Server is shutting down now');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Server is shutting down now');
  console.log(err.name, err.message);
  process.exit(1);
});
