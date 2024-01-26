const express = require('express');
const route = express.Router();
const adminController = require('../../controllers/admin/adminController');
const logisticsOrderController = require('../../controllers/admin/logisticsOrderController');
const authenticationMiddleware = require('../../middlewares/authenticationMiddleware');

route.get('/dashboard', authenticationMiddleware.ensureAuthenticated, adminController.dashboardPage);
route.get('/profile', authenticationMiddleware.ensureAuthenticated, adminController.profilePage);

// createUser.ejs
route.get('/createUser', authenticationMiddleware.ensureAuthenticated, adminController.createUserPage);
route.post('/createUser', authenticationMiddleware.ensureAuthenticated, adminController.createUser);

// userList.ejs
route.get('/userList', authenticationMiddleware.ensureAuthenticated, adminController.userListPage);
route.get('/userList/edit/:userId', authenticationMiddleware.ensureAuthenticated, adminController.editUserPage);
route.post('/userList/edit/:userId', authenticationMiddleware.ensureAuthenticated, adminController.editUser);
// route.get('/userList/delete/:userId', authenticationMiddleware.ensureAuthenticated, adminController.deleteUser); // Remove this from "userListPage" when is done.
route.post('/userList/edit/delete/:userId', authenticationMiddleware.ensureAuthenticated, adminController.deleteEditUser);

// createLogisticsOrder.ejs
route.get('/createLogisticsOrder', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.createLogisticsOrderPage);
route.post('/createLogisticsOrder', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.createLogisticsOrder);

// logisticsOrderList.ejs
route.get('/logisticsOrderList', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderListPage);

// editLogisticsOrder.ejs
route.get('/logisticsOrderList/edit/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.editLogisticsOrderPage);
route.post('/logisticsOrderList/edit/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.editLogisticsOrder);
route.post('/logisticsOrderList/edit/delete/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.deleteEditLogisticsOrder);

// logisticsOrderFeedPage.ejs
route.get('/logisticsOrderFeed', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderFeedPage);


// Logout
route.post('/logout', adminController.logout);

module.exports = route;