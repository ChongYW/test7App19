// For debbuging (2/2) start.
// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('warning', 'Before using this function, you need to be logged in!');
  res.redirect('/login');
};

// Middleware to check if the user is not authenticated
const ensureNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  let redirectURL = '/login';

  if (req.user && req.user.role === 'admin') {
    redirectURL = '/admin/dashboard';
  } else if (req.user && req.user.role === 'customerService') {
    redirectURL = '/customerService/dashboard';
  } else {
    redirectURL = '/runner/dashboard';
  }

  req.flash('warning', 'You already logged in, this action is no needed.');
  return res.render('somethingWrong', { redirectURL });

};

const isRole = (role) => (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === role) {
    return next();
  }

  let redirectURL = '/' + req.user.role + '/dashboard';
  req.flash('error', 'You are not authorized to perform this operation!');
  res.render('somethingWrong', { redirectURL });

}
// For debbuging (2/2) end.

// // Middleware to check if user is authenticated
// const ensureAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated() && req.user.status === 'active') {
//     return next();
//   } else if (req.isAuthenticated() && req.user.status !== 'active') {
//     const authenticationError = new Error();
//     authenticationError.status = 403;
//     next(authenticationError);
//   }

//   const authenticationError = new Error();
//   authenticationError.status = 401;
//   next(authenticationError);
// };

// // Middleware to check if the user is not authenticated
// const ensureNotAuthenticated = (req, res, next) => {
//   if (!req.isAuthenticated()) {
//     return next();
//   }

//   const authenticationError = new Error();
//   authenticationError.status = 302;
//   next(authenticationError);
// };

// const isRole = (role) => (req, res, next) => {
//   if (req.isAuthenticated() && req.user.role === role) {
//     return next();
//   }

//   const authenticationError = new Error();
//   authenticationError.status = 403;
//   next(authenticationError);
// }

// debug---

const isAdmin = isRole('admin');
const isCustomerService = isRole('customerService');
const isRunner = isRole('runner');

module.exports = {
  ensureAuthenticated,
  ensureNotAuthenticated,
  isAdmin,
  isCustomerService,
  isRunner,
};