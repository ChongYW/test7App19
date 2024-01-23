var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv').config();
const passport = require('passport');
const flash = require('express-flash');

const User = require('./models/userModel');
const connectDb = require('./config/dbConnecttion');
const sessionMiddleware = require('./middlewares/sessionMeddleware');
const authenticationMiddleware = require('./middlewares/authenticationMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const cacheControlMiddleware = require('./middlewares/cacheControlMiddleware');

const adminRoute = require('./routes/admin/adminRoute');
const userBRoute = require('./routes/userB/userBRoute');
const loginRoute = require('./routes/loginRoute');

connectDb();
var app = express();

// Use the cache control middleware
app.use(cacheControlMiddleware);

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
// Use flash messages
app.use(flash());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRoute);
// app.use('/admin', adminRoute);
app.use('/admin', authenticationMiddleware.ensureAuthenticated, authenticationMiddleware.isAdmin, adminRoute);
app.use('/userB', authenticationMiddleware.ensureAuthenticated, authenticationMiddleware.isUserB, userBRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// app.use(errorMiddleware.handleError);

// For debbuging (1/2) start.
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// For debbuging (1/2) end.

module.exports = app;

// Stop at `editLogisticsOrder()` edit order validation.
// Stop at create the order list and edit(Same as user list).