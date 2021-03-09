const express = require('express');
const app = express();
const User = require('./models/User');
const cors = require('cors');

app.use(express.json());
app.use(cors());

const userController = require('./controllers/userController.js');

app.use('/', userController);

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
