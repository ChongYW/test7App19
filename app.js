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
const logEntriesMiddleware = require('./middlewares/logEntriesMiddleware');

const adminRoute = require('./routes/admin/adminRoute');
const customerServiceRoute = require('./routes/customerService/customerServiceRoute');
const runnerRoute = require('./routes/runner/runnerRoute');
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

// Log Entries Middleware
app.use(logEntriesMiddleware.logEntries);

app.use('/', loginRoute);
// app.use('/admin', adminRoute);
app.use('/admin', authenticationMiddleware.ensureAuthenticated, authenticationMiddleware.isAdmin, adminRoute);
app.use('/customerService', authenticationMiddleware.ensureAuthenticated, authenticationMiddleware.isCustomerService, customerServiceRoute);
app.use('/runner', authenticationMiddleware.ensureAuthenticated, authenticationMiddleware.isRunner, runnerRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// app.use(errorMiddleware.handleError);

// For debbuging (1/2) start.
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// For debbuging (1/2) end.

module.exports = app;

// Stop at:
// 26/3/2024
// * Need to add the commission or complete order list for each role.

// 20/3/24:
// * Front-end add "thirdPartyTrackingCode" field.
// * Add "thirdPartyTrackingCode" field at `editLogisticsOrder()` function.

// Stop at continue the runner commission function and EJS.

// Stop at create the runner commission function and EJS.

// Stop at debugging the `editUserQuantityBasedCommissionStatusList()`, it will split the ID when it has 1 Quantity Based Commission and cant update the data.

// Stop at add the total amount of "Not Claimed" of the current target edit user, and the options of update "commissionStatus" status.
// Stop at debuging the `editUserQuantityBasedCommissionListPage()` function, cant search the data...

// Stop at create the `editUserQuantityBasedCommissionListPage()` function and EJS, add the total amount of "Not Claimed" of the current target edit user, and the options of update "commissionStatus" status.

// Stop at modifying the logic of "quantityBasedCommissionModel" or the "logisticsOrderModel", it should add the "qty" of the box.

// Stop at debugging `usersLogEntriesListPage()` the "updateData" switch case, it cant search the value inside a obj from a data.
// Stop at modifying the `logEntries()` to record the user log.
// Stop at adding the status code in every function.

// Stop at debugging "updateProfile()" function.
// Stop at create "updateProfile()" function.
// Stop at create "logisticsOrderDetailsAndActions()" function.
// Stop at create "Start Deliver List" EJS page and function.
// Stop at debugging `startDeliver()` function.

// Stop at create EJS:
// 1. Logistic order draft.
// 2. Delivery list

// Stop at Order status flow checking.
// Stop at adding the "Logistics Orders" to "Delivery list".
// Stop at create `LogisticsGrab` model.
// Stop at about create the logistics order post/news feed.

// Reminder / Notes:
// 1. Remove some function in lower lever role:
//    * In "Edit Logistics Order" from User B, like "User ID"...
// 2. (Done)Add "Reciver", "Phone" and "PaymentType" field to the "Logistic order" model. DONE
// 3. (Done)Change the "UserB" to "CustomerService" and "UserC" to "Runner". DONE
// 4. The `logisticsOrderPendingListPage()` need to change it only show the create by current user "Logistics Order Pending List".
// 5. `usersLogEntriesListPage()` the "updateData" switch case, it cant search the value inside a obj from a data.
// 6. (Pause)The `addToDeliveryList()` need to sperate it from Customer Service role, cause it will use the bug to request the commission.
// 7. (Done)The "Repeat Order" should have the secure check it is really a repeat order, or else the Customer Service can use the leak of logic to cheat. DONE
// 8. (Done)The `editUserQuantityBasedCommissionStatusList()`, it will split the ID when it has 1 Quantity Based Commission and cant update the data. DONE
// 9. (Done)Need to add the opions and logic to let the runner user or the customer service collect the payment. Done
// 10. (Done)Remove all "Delete" function, replace with "Hide", to avoid unnecessary chain bug. Done
// 11. (Done)Add "trackingCode" at "LogisticsOrder" model for customer track the third party logistic. Done
// 12. (Done)Add "country" at User model to make the commission link to the national currency. Done
// 13. (Pause)If is edit own profile will not able to "Hide" it self.
// 14. (Done)Only user with status "active" are able to login. Done
// 15. (Done)Add a "completed" order or commission list for specific user role, example like commission list for CS and runner.