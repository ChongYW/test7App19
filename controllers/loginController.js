// const User = require('../models/userModel');
const passport = require('passport');

// const testPage = (req, res) => {
//   res.render('test');
// }

const loginPage = (req, res) => {
  res.render('login');
}

const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash('error', 'Email or Password is wrong!');
      return res.status(401).redirect('/login');
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      if (req.user && req.user.role === 'admin' && req.user.status === 'active') {
        return res.redirect('/admin/dashboard');
      } else if (req.user && req.user.role === 'customerService' && req.user.status === 'active') {
        return res.redirect('/customerService/dashboard');
      } else if (req.user && req.user.role === 'runner' && req.user.status === 'active') {
        return res.redirect('/runner/dashboard');
      } else {
        req.flash('warnning', 'Something wrong about your account, please contact your administrator for assistance.');
        const authenticationError = new Error();
        authenticationError.status = 401;
        next(authenticationError);
      }

    });
  })(req, res, next);
};

module.exports = {
  // testPage,
  loginPage,
  login,
}