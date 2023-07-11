const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! server is shutting down now');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

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

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
server.setMaxListeners(0);

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('chat message', msg => {
    console.log('Message:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! server is shutting down now');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = io;
