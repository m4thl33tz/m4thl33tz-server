const express = require('express');
const app = express();
const User = require('./models/User');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.post('/newUser', (req, res, next) => {
  console.log(req.body);
  User.addNewUser(req.body)
    .then((user) => res.send(user))
    .catch(next);
});
app.get('/checkUser/:id', (req, res, next) => {
  User.findByUniqueId(req.params.id)
    .then((user) => res.send(user))
    .catch(next);
});

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
