const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()
  .post('/newUser', (req, res, next) => {
    User.addNewUser(req.body)
      .then((user) => res.send(user))
      .catch(next);
  })
  .get('/checkUser/:id', (req, res, next) => {
    User.findByEmail(req.params.id)
      .then((user) => res.send(user))
      .catch(next);
  });
