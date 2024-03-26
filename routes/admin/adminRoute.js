const express = require('express');
const route = express.Router();
const adminController = require('../../controllers/admin/adminController');
const logisticsOrderController = require('../../controllers/admin/logisticsOrderController');
const commissionController = require('../../controllers/admin/commissionController');
const authenticationMiddleware = require('../../middlewares/authenticationMiddleware');

route.get('/dashboard', authenticationMiddleware.ensureAuthenticated, adminController.dashboardPage);

// profile.ejs
route.get('/profile', authenticationMiddleware.ensureAuthenticated, adminController.profilePage);
route.post('/profile/updateProfile', authenticationMiddleware.ensureAuthenticated, adminController.updateProfile);

// createUser.ejs
route.get('/createUser', authenticationMiddleware.ensureAuthenticated, adminController.createUserPage);
route.post('/createUser', authenticationMiddleware.ensureAuthenticated, adminController.createUser);

// userList.ejs
route.get('/userList', authenticationMiddleware.ensureAuthenticated, adminController.userListPage);
route.get('/userList/edit/:userId', authenticationMiddleware.ensureAuthenticated, adminController.editUserPage);
route.post('/userList/edit/:userId', authenticationMiddleware.ensureAuthenticated, adminController.editUser);
// route.get('/userList/delete/:userId', authenticationMiddleware.ensureAuthenticated, adminController.deleteUser); // Remove this from "userListPage" when is done.
route.post('/userList/edit/delete/:userId', authenticationMiddleware.ensureAuthenticated, adminController.deleteEditUser);

// usersLogEntriesList.ejs
route.get('/usersLogEntriesList', authenticationMiddleware.ensureAuthenticated, adminController.usersLogEntriesListPage);

// quantityBasedCommissionList.ejs
route.get('/quantityBasedCommissionList', authenticationMiddleware.ensureAuthenticated, commissionController.quantityBasedCommissionListPage);

// editUserQuantityBasedCommissionList.ejs
route.get('/editUserQuantityBasedCommissionList/edit/:userId', authenticationMiddleware.ensureAuthenticated, commissionController.editUserQuantityBasedCommissionListPage);
route.get('/editUserQuantityBasedCommissionList/:userId', authenticationMiddleware.ensureAuthenticated, commissionController.editUserQuantityBasedCommissionListPage);
route.post('/editUserQuantityBasedCommissionStatusList', authenticationMiddleware.ensureAuthenticated, commissionController.editUserQuantityBasedCommissionStatusList);

// deliveryCommissionList.ejs
route.get('/deliveryCommissionList', authenticationMiddleware.ensureAuthenticated, commissionController.deliveryCommissionListPage);

// editUserDeliveryCommissionList.ejs
route.get('/editUserDeliveryCommissionList/edit/:userId', authenticationMiddleware.ensureAuthenticated, commissionController.editUserDeliveryCommissionListPage);
route.get('/editUserDeliveryCommissionList/:userId', authenticationMiddleware.ensureAuthenticated, commissionController.editUserDeliveryCommissionListPage);
route.post('/editUserDeliveryCommissionList', authenticationMiddleware.ensureAuthenticated, commissionController.editUserDeliveryCommissionStatusList);

// createLogisticsOrder.ejs
route.get('/createLogisticsOrder', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.createLogisticsOrderPage);
route.post('/createLogisticsOrder', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.createLogisticsOrder);

// logisticsOrderPendingList.ejs
route.get('/logisticsOrderPendingList', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderPendingListPage);

// logisticsOrderList.ejs
route.get('/logisticsOrderList', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderListPage);

// editLogisticsOrder.ejs
route.get('/logisticsOrderList/edit/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.editLogisticsOrderPage);
route.post('/logisticsOrderList/edit/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.editLogisticsOrder);
route.post('/logisticsOrderList/edit/delete/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.deleteEditLogisticsOrder);

// logisticsOrderFeed.ejs
route.get('/logisticsOrderFeed', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderFeedPage);

// logisticsOrderDetails.ejs
route.get('/logisticsOrderFeed/logisticsOrderDetails/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderDetailsPage);
route.post('/logisticsOrderFeed/logisticsOrderDetails/addToDeliveryList/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.addToDeliveryList);

// deliveryList.ejs
route.get('/deliveryList', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.deliveryListPage);

// deliveryDetails.ejs
route.get('/deliveryList/deliveryDetails/:deliveryId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.deliveryDetailsPage);// here
route.post('/deliveryList/deliveryDetails/removeFromDeliveryList/:deliveryId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.removeFromDeliveryList);

// startDeliver.ejs
route.post('/deliveryList/deliveryDetails/startDeliver', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.startDeliver);
route.get('/startDeliverList', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.startDeliverListPage);

// logisticsOrderDetailsAndActions.ejs
route.get('/startDeliverList/logisticsOrderDetailsAndActions/:deliveryId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderDetailsAndActionsPage);
route.post('/startDeliverList/logisticsOrderDetailsAndActions/:deliveryId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.logisticsOrderDetailsAndActions);

// Logout
route.post('/logout', adminController.logout);

module.exports = route;