// // Import required packages
// const http = require('http');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');

// // Error handling for uncaught exceptions
// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION! server is shutting down now');
//   console.log(err.name, err.message);

//   process.exit(1);
// });

// // Load environment variables from .env file
// dotenv.config({ path: './config.env' });

// // Import Express app
// const app = require('./app');

// // Connect to MongoDB database
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('DB Connection Successful!');
//   })
//   .catch(err => {
//     console.error('DB Connection Error:', err);
//   });

// const PORT = process.env.PORT || 9000;

// // Session configuration
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: new MongoStore({
//       mongoUrl: DB,
//       ttl: 7 * 24 * 60 * 60,
//     }),
//   })
// );

// // Create HTTP server using the Express app
// const server = http.createServer(app);
// server.listen(PORT, () => {
//   console.log(`Server is running on ${PORT}`);
// });

// // Error handling for unhandled rejections
// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! server is shutting down now');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// Import required packages
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const socketIo = require('socket.io');

// Error handling for uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! server is shutting down now');
  console.log(err.name, err.message);

  process.exit(1);
});

// Load environment variables from .env file
dotenv.config({ path: './config.env' });

// Import Express app
const app = require('./app');

// Connect to MongoDB database
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

const PORT = process.env.PORT || 9000;

// Session configuration
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

// Create HTTP server using the Express app
const server = http.createServer(app);

// Create Socket.io server and attach it to the HTTP server
const io = socketIo(server);

// Import view controller
const viewController = require('./view.controller')(io);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// Error handling for unhandled rejections
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! server is shutting down now');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
