const express = require('express');
const route = express.Router();
const customerServiceController = require('../../controllers/customerService/customerServiceController');
const logisticsOrderController = require('../../controllers/customerService/logisticsOrderController');
const commissionController = require('../../controllers/customerService/commissionController');
const authenticationMiddleware = require('../../middlewares/authenticationMiddleware');

// dashboard.ejs
route.get('/dashboard', authenticationMiddleware.ensureAuthenticated, customerServiceController.dashboardPage);

// profile.ejs
route.get('/profile', authenticationMiddleware.ensureAuthenticated, customerServiceController.profilePage);
route.post('/profile/updateProfile', authenticationMiddleware.ensureAuthenticated, customerServiceController.updateProfile);

// quantityBasedCommissionHistoryList.ejs
route.get('/quantityBasedCommissionHistoryList', authenticationMiddleware.ensureAuthenticated, commissionController.quantityBasedCommissionHistoryListPage)

// deliveryCommissionListHistory.ejs
route.get('/deliveryCommissionHistoryList', authenticationMiddleware.ensureAuthenticated, commissionController.deliveryCommissionListHistoryPage)

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
// route.post('/logisticsOrderList/edit/delete/:logisticsOrderId', authenticationMiddleware.ensureAuthenticated, logisticsOrderController.deleteEditLogisticsOrder);

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
route.post('/logout', customerServiceController.logout);

module.exports = route;