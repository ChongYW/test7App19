const express = require('express');
const route = express.Router();
// const User = require('../models/userModel');
const loginController = require('../controllers/loginController');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');

// route.get('/', loginController.testPage);
route.get('/login', authenticationMiddleware.ensureNotAuthenticated, loginController.loginPage);
route.post('/login', authenticationMiddleware.ensureNotAuthenticated, loginController.login);

module.exports = route;