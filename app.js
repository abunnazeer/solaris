const express = require('express');
// const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// controller
const globalErrorHandler = require('./controller/error.controller');
const auth = require('./controller/auth.controller');
// const AppError = require('../utils/appError');
//importing routers
const userRouter = require('./routes/user.routers');

const app = express();
// GLOBAL MIDDLEWARE

// set security HTTP Headers
// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       // defaultSrc: ["'self'", 'data:', 'blob:'],

//       // fontSrc: ["'self'", 'https:', 'data:'],

//       // scriptSrc: ["'self'", 'unsafe-inline'],

//       scriptSrc: ["'self'", 'https://*.cloudflare.com'],

//       scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com'],

//       // styleSrc: ["'self'", 'https:', 'unsafe-inline'],

//       connectSrc: ["'self'", 'data', 'https://*.cloudflare.com'],
//     },
//   })
// );
// loading development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit request from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too Many Request from this ip, Please try again in an hour!',
// });
// app.use('/login', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Data sanitazation agasnt noSQL Injection
// app.use(mongoSanitize());

// Data sanitize  against xss
// app.use(xss());

// prevent paramiter polutioon
// app.use(
//   hpp({
//     //add value to array latter if you want to whitelist
//     // whitelist: [],
//   })
// );
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public/')));

// Test Middle Ware

// app.use((req, res, next) => {
//   req.requestTime = new Date().toDateString();
//   console.log(req.cookies);
//   next();
// });
// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });
app.get('/dashboard', auth.protect, (req, res) => {
  res.status(200).render('dashboard', { title: 'Dashboard' });
});

app.use(userRouter);

// Error Handling midleware
app.use(globalErrorHandler);
module.exports = app;
