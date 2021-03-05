const express = require('express');
const app = express();
const User = require('./models/User');

app.use(express.json());

app.post('/newUser', (req, res, next) => {
  User.addNewUser(req.body)
    .then((user) => res.send(user))
    .catch(next);
});

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
