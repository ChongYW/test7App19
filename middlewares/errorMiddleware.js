const handleError = (err, req, res, next) => {
  let statusCode;
  let statusCodeDetails;
  let redirectURL;

  switch (err.status) {
    case 302:
      statusCode = '302 Found';
      statusCodeDetails = "You've taken the relevant action.";
      redirectURL = req.isAuthenticated() ? '/' + req.user.role + '/dashboard' : '/login';
      break;

    case 401:
      statusCode = '401 Unauthorized';
      statusCodeDetails = "Please login first before entering this site";
      redirectURL = req.isAuthenticated() ? '/' + req.user.role + '/dashboard' : '/login';
      break;

    case 403:
      statusCode = '403 Forbidden';
      statusCodeDetails = "You are not authorized to perform this operation!";
      if (!req.isAuthenticated()) {
        redirectURL = '/login'; // User not authenticated, redirect to login
      } else if (req.user.status !== 'active') {
        req.flash('error', 'Something wrong with your account, please contact your administrator for assistance.');
        req.logout((err) => { // Logout the user
          if (err) {
            console.error('Error logging out user:', err);
          }
          redirectURL = '/login'; // Redirect to login after logout
        });
      } else {
        redirectURL = '/' + req.user.role + '/dashboard'; // Authenticated and active user, redirect to dashboard
      }
      break;

    case 404:
      statusCode = '404 Not Found';
      statusCodeDetails = "The Page or the URL you trying to access is not found...";
      redirectURL = req.isAuthenticated() ? '/' + req.user.role + '/dashboard' : '/login';
      break;

    default:
      statusCode = '500 Internal Server Error';
      statusCodeDetails = "Something wrong, please try again later...";
      redirectURL = req.isAuthenticated() ? '/' + req.user.role + '/dashboard' : '/login';
      break;
  }

  req.flash('statusCode', statusCode);
  req.flash('statusCodeDetails', statusCodeDetails);
  return res.render('somethingWrong', {
    error: err,
    redirectURL,
  });
}

module.exports = {
  handleError,
}