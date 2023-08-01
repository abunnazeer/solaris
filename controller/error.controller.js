const express = require('express');
const AppError = require('../utils/appError');

// Handle cast errors when converting data types in the database
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle duplicate field errors in the database
const handleDuplicateFieldDB = err => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle validation errors in the database
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle invalid JSON Web Token error
const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

// Handle expired JSON Web Token error
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please login again.', 401);

// Send detailed error response in development mode
const sendErrorDev = (req, err, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // For API requests, send JSON response with error details
    // return res.status(err.statusCode).json({
    //   status: err.status,
    //   error: err,
    //   message: err.message,
    //   stack: err.stack,
    // });
    return res.status(err.statusCode).render('response/status', {
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // For other requests, render an error page
  console.log(err.message); // Log the error message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

// Send summarized error response in production mode
const sendErrorProd = (req, err, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // For operational errors, send JSON response with summarized message
      // return res.status(err.statusCode).json({
      //   status: err.status,
      //   message: err.message,
      // });
      return res.status(err.statusCode).render('response/status', {
        status: err.status,
        message: err.message,
      });
    }

    // For non-operational errors, send a generic error response
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  if (err.isOperational) {
    // For operational errors, render an error page with summarized message
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  // For non-operational errors, send a generic error response
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Development mode error handling
    sendErrorDev(req, err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Production mode error handling

    // Create a new error object to avoid modifying the original error
    let error = { ...err };
    error.message = err.message;

    // Handle specific types of errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(req, error, res);
  }
};

module.exports = globalErrorHandler;
