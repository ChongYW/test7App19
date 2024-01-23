const express = require('express');
const route = express.Router();
const adminController = require('../../controllers/admin/adminController');
const logisticsOrderController = require('../../controllers/admin/logisticsOrderController');
const authenticationMiddleware = require('../../middlewares/authenticationMiddleware');

route.get('/dashboard', adminController.dashboardPage);
route.get('/profile', adminController.profilePage);

// createUser.ejs
route.get('/createUser', adminController.createUserPage);
route.post('/createUser', adminController.createUser);

// userList.ejs
route.get('/userList', adminController.userListPage);
route.get('/userList/edit/:userId', adminController.editUserPage);
route.post('/userList/edit/:userId', authenticationMiddleware.ensureAuthenticated, adminController.editUser);
route.get('/userList/delete/:userId', adminController.deleteUser); // Remove this from "userListPage" when is done.
route.post('/userList/edit/delete/:userId', authenticationMiddleware.ensureAuthenticated, adminController.deleteEditUser);

// createLogisticsOrder.ejs
route.get('/createLogisticsOrder', logisticsOrderController.createLogisticsOrderPage);
route.post('/createLogisticsOrder', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.createLogisticsOrder);

// logisticsOrderList.ejs
route.get('/logisticsOrderList', logisticsOrderController.logisticsOrderListPage);

// editLogisticsOrder.ejs
route.get('/logisticsOrderList/edit/:logisticsOrderId', logisticsOrderController.editLogisticsOrderPage);
route.post('/logisticsOrderList/edit/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.editLogisticsOrder);
route.post('/logisticsOrderList/edit/delete/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.deleteEditLogisticsOrder);

// Logout
route.post('/logout', adminController.logout);

module.exports = route;