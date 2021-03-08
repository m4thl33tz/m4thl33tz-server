import User from '../models/User';

module.exports = (err, req, res, next) => {
  User.addNewUser({});
};
