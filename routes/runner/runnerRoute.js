const express = require('express');
const route = express.Router();
const runnerController = require('../../controllers/runner/runnerController');
const logisticsOrderController = require('../../controllers/runner/logisticsOrderController');
const commissionController = require('../../controllers/runner/commissionController');
const authenticationMiddleware = require('../../middlewares/authenticationMiddleware');

// dashboard.ejs
route.get('/dashboard', authenticationMiddleware.ensureAuthenticated, runnerController.dashboardPage);

// profile.ejs
route.get('/profile', authenticationMiddleware.ensureAuthenticated, runnerController.profilePage);
route.post('/profile/updateProfile', authenticationMiddleware.ensureAuthenticated, runnerController.updateProfile);

// deliveryCommissionListHistory.ejs
route.get('/deliveryCommissionHistoryList', authenticationMiddleware.ensureAuthenticated, commissionController.deliveryCommissionListHistoryPage)

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

route.post('/logout', runnerController.logout);

module.exports = route;