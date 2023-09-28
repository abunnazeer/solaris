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
const cron = require('node-cron');

// Importing routers
const Transactions = require('./models/portfolio/transaction.model');
const Portfolio = require('./models/portfolio/portfolio.model');
const buyPortfolio = require('./models/portfolio/buyportfolio.model');
const userRouter = require('./routes/user.routers');
const portfolioRouter = require('./routes/portfolio.routers');
const activity = require('./routes/activity.routers');
const referral = require('./routes/referral.routers');
const {
  dailyPayout,
  compoundingPayout,
} = require('./controller/paying.controller');
const {
  dashboard,
  userDashboard,
} = require('./controller/dashboard.controller');
const chartRouter = require('./routes/chart.router');

const {
  protect,
  verificationMiddleWare,
  restrictTo,
} = require('./controller/auth.controller');
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
    saveUninitialized: true,
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
app.use('/dashboard', protect, dashboard);
app.use(
  '/user/users-dashboard/:id',
  protect,
  restrictTo('admin'),
  userDashboard
);
app.use('/chart', chartRouter);

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
    // Parse the message and update the dashboard accordingly
    const { portfolioId, balance, compBalance } = JSON.parse(message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
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

// cron.schedule('0 3 * * 1-5', dailyPayout);
// cron.schedule('0 3 * * 1-5', compoundingPayout);
// cron.schedule('*/40 * * * * *', () => {
//   console.log('==============================================');
//   console.log('Running daily a task every 40 seconds');
//   dailyPayout();
// });
// cron.schedule('*/40 * * * * *', () => {
//   console.log('Running compounding a task every 40 seconds');
//   console.log('==============================================');
//   compoundingPayout();
// });

// Cron jobs with improved logging
// cron.schedule('0 3 * * *', () => {
//   console.log('Starting dailyPayout cron job at', new Date().toISOString());
//   dailyPayout();
// });

// cron.schedule('0 3 * * *', () => {
//   console.log('Starting compoundingPayout cron job at', new Date().toISOString());
//   compoundingPayout();
// });



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
