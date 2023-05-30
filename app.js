const express = require('express');
// const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const globalErrorHandler = require('./controller/error.controller');
//importing routers
const userRouter = require('./routes/user.routers');

const app = express();
// app.use(
//   cors({
//     origin: 'http://localhost:8000',
//   })
// );

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public/')));
// app.use(express.static(__dirname + '/public'));

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });
app.get('/dashboard', (req, res) => {
  res.status(200).render('dashboard', { title: 'Dashboard' });
});
app.use(userRouter);

// Error Handling midleware
app.use(globalErrorHandler);
module.exports = app;
