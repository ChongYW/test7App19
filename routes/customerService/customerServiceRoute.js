const express = require('express');
const route = express.Router();
const customerServiceController = require('../../controllers/customerService/customerServiceController');

route.get('/dashboard', customerServiceController.dashboardPage);
route.get('/profile', customerServiceController.profilePage);
route.post('/logout', customerServiceController.logout);

module.exports = route;