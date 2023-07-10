// // // Import required packages
// // const http = require('http');
// // const mongoose = require('mongoose');
// // const dotenv = require('dotenv');
// // const session = require('express-session');
// // const MongoStore = require('connect-mongo');

// // // Error handling for uncaught exceptions
// // process.on('uncaughtException', err => {
// //   console.log('UNCAUGHT EXCEPTION! server is shutting down now');
// //   console.log(err.name, err.message);

// //   process.exit(1);
// // });

// // // Load environment variables from .env file
// // dotenv.config({ path: './config.env' });

// // // Import Express app
// // const app = require('./app');

// // // Connect to MongoDB database
// // const DB = process.env.DATABASE.replace(
// //   '<PASSWORD>',
// //   process.env.DATABASE_PASSWORD
// // );
// // mongoose
// //   .connect(DB, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //   })
// //   .then(() => {
// //     console.log('DB Connection Successful!');
// //   })
// //   .catch(err => {
// //     console.error('DB Connection Error:', err);
// //   });

// // const PORT = process.env.PORT || 9000;

// // // Session configuration
// // app.use(
// //   session({
// //     secret: process.env.SESSION_SECRET,
// //     resave: false,
// //     saveUninitialized: false,
// //     store: new MongoStore({
// //       mongoUrl: DB,
// //       ttl: 7 * 24 * 60 * 60,
// //     }),
// //   })
// // );

// // // Create HTTP server using the Express app
// // const server = http.createServer(app);
// // server.listen(PORT, () => {
// //   console.log(`Server is running on ${PORT}`);
// // });

// // // Error handling for unhandled rejections
// // process.on('unhandledRejection', err => {
// //   console.log('UNHANDLED REJECTION! server is shutting down now');
// //   console.log(err.name, err.message);
// //   server.close(() => {
// //     process.exit(1);
// //   });
// // });

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

// // Create HTTP server using the Express app
// const server = http.createServer(app);

// // Add this line at the end
// const { io } = require('socket.io')(server);

// // Export the io object
// module.exports.io = io;

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
// Import required packages
// const http = require('http');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');

// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION! server is shutting down now');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

// dotenv.config({ path: './config.env' });

// const app = require('./app');

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

// const server = http.createServer(app);
// const { Server } = require('socket.io');
// const io = new Server(server);
// server.setMaxListeners(0);

// io.on('connection', socket => {
//   console.log('A user connected');

//   socket.on('chat message', msg => {
//     console.log('Message:', msg);
//     io.emit('chat message', msg);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server is running on ${PORT}`);
// });

// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! server is shutting down now');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// module.exports = io;
