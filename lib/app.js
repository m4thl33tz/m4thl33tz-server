const express = require('express');
const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:7891'
  }
});

app.use(express.json());


const userController = require('./controllers/userController.js');

app.use('/', userController);

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

require('./handlers/gameRoom')(io);

module.exports = http;
