const express = require('express');
const route = express.Router();
const adminController = require('../../controllers/admin/adminController');
const authenticationMiddleware = require('../../middlewares/authenticationMiddleware');

route.get('/createUser', adminController.createUserPage);
route.post('/createUser', adminController.createUser);
route.get('/dashboard', adminController.dashboardPage);
route.get('/profile', adminController.profilePage);

route.get('/userList', adminController.userListPage);
route.get('/userList/edit/:userId', adminController.editUserPage);
route.post('/userList/edit/:userId', authenticationMiddleware.ensureAuthenticated, adminController.editUser);
route.get('/userList/delete/:userId', adminController.deleteUser); // Remove this from "userListPage" when is done.
route.post('/userList/edit/delete/:userId', authenticationMiddleware.ensureAuthenticated, adminController.deleteEditUser);

route.post('/logout', adminController.logout);

module.exports = route;