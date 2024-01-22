const express = require('express');
const route = express.Router();
const userBController = require('../../controllers/userB/userBController');

route.get('/dashboard', userBController.dashboardPage);
route.get('/profile', userBController.profilePage);
route.post('/logout', userBController.logout);

module.exports = route;