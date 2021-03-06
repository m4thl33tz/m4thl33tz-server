const express = require('express');
const app = express();
app.use(require('cors')());
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

app.use(express.json());

const userController = require('./controllers/userController.js');
const pointsController = require('./controllers/pointsController.js');
app.use('/user', userController);
app.use('/points', pointsController);
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

require('./handlers/gameRoom/gameRoom')(io);

module.exports = http;
