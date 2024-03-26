const LogisticsOrder = require('../../models/logisticsOrderModel');
const User = require('../../models/userModel');
const DeliveryList = require('../../models/deliveryListModel');
const QuantityBasedCommission = require('../../models/quantityBasedCommissionModel');
const DeliveryCommission = require('../../models/deliveryCommissionModel');
const mongoose = require('mongoose');
const flash = require('express-flash');

const quantityBasedCommissionListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10; // Adjust this value based on your preference
        const skip = (page - 1) * perPage;

        // Initialize variables with default values
        let searchQuery = '';
        let searchField = '_id';

        // Initialize an array to store user and commission data
        const userCommissionData = [];

        if (req.query.search) {
            searchQuery = req.query.search;
        }
        if (req.query.searchField) {
            searchField = req.query.searchField;
        }

        let query = {
            // commissionStatus: searchCommissionStatusType
        };

        if (searchQuery && searchField) {
            switch (searchField) {
                case '_id':
                    if (mongoose.Types.ObjectId.isValid(searchQuery)) {
                        query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery) };
                    } else {
                        // If not a valid ObjectId, assume it's a user name
                        const userQuery = { username: new RegExp(searchQuery, 'i') };
                        const users = await User.find(userQuery, '_id');
                        const userIds = users.map(user => user._id);

                        if (userIds.length === 0) {
                            req.flash('warning', `No user found with the username "${searchQuery}".`);
                            return res.status(200).redirect('/admin/quantityBasedCommissionList');
                        }

                        query = { ...query, [searchField]: { $in: userIds } };
                    }
                    break;

                case 'role':
                    query = { [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
                    break;

                default:
                    req.flash('warning', 'Invalid search field.');
                    return res.status(200).redirect('/admin/quantityBasedCommissionList');
            }
        }

        const targetUser = await User
            .find(query)
            .skip(skip)
            .limit(perPage);;

        const totalTargetUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalTargetUsers / perPage);

        const pagination = {
            prev: page > 1 ? `/admin/quantityBasedCommissionList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            next: page < totalPages ? `/admin/quantityBasedCommissionList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            current: page,
            totalPages: totalPages,
        };

        // Iterate through each user to get commission data
        // for (const user of targetUser) {
        //     const targetCommissions = await QuantityBasedCommission
        //         .find({
        //             user_id: user._id,
        //             commissionStatus: 'Not Claimed'
        //         });

        //     console.log(`Line 84 LogisticsOrder id: ${targetCommissions.logisticsOrder_id._id}`);
        //     console.log(`Line 85 LogisticsOrder id: ${targetCommissions.logisticsOrder_id.productQty}`);

        //     let getCurrentNotClaimedCommissionProductQty = await LogisticsOrder.findById(targetCommissions.logisticsOrder_id);
        //     let currentNotClaimedCommissionProductQty = getCurrentNotClaimedCommissionProductQty.productQty;
        //     let totalNotClaimedCommissionProductQty = currentNotClaimedCommissionProductQty;

        //     let totalNotClaimedCommissionAmount = 0;

        //     // Calculate total commission amount
        //     for (const commission of targetCommissions) {
        //         totalNotClaimedCommissionProductQty += totalNotClaimedCommissionProductQty;
        //         totalNotClaimedCommissionAmount += commission.commissionAmount;
        //     }

        //     // Push user and commission data to the array
        //     userCommissionData.push({
        //         user_id: user._id,
        //         userRole: user.role,
        //         username: user.username,
        //         // commissionQty: totalNotClaimedCommissionProductQty,
        //         totalNotClaimedCommissionProductQty: totalNotClaimedCommissionProductQty,
        //         totalNotClaimedCommissionAmount: totalNotClaimedCommissionAmount
        //     });
        // }
        // Iterate through each user to get commission data
        for (const user of targetUser) {
            const targetCommissions = await QuantityBasedCommission
                .find({
                    user_id: user._id,
                    commissionStatus: 'Not Claimed'
                })
                .populate({
                    path: 'logisticsOrder_id',
                    model: 'LogisticsOrder',
                    select: 'productQty',
                    // populate: {
                    //   path: 'createdByUser',
                    //   model: 'User',
                    //   select: 'username'
                    // }
                });

            let totalNotClaimedCommissionProductQty = 0; // Initialize total quantity accumulator
            let totalNotClaimedCommissionAmount = 0;

            // Iterate through each commission for the user
            for (const commission of targetCommissions) {
                // Get LogisticsOrder by ID
                let getCurrentNotClaimedCommissionProductQty = await LogisticsOrder.findById(commission.logisticsOrder_id);
                let currentNotClaimedCommissionProductQty = getCurrentNotClaimedCommissionProductQty.productQty;

                // Add the productQty to the total quantity
                totalNotClaimedCommissionProductQty += currentNotClaimedCommissionProductQty;

                // Add the commissionAmount to the total amount
                totalNotClaimedCommissionAmount += commission.commissionAmount;
            }

            // Push user and commission data to the array
            userCommissionData.push({
                user_id: user._id,
                userRole: user.role,
                username: user.username,
                totalNotClaimedCommissionProductQty: totalNotClaimedCommissionProductQty,
                totalNotClaimedCommissionAmount: totalNotClaimedCommissionAmount
            });
        }


        if (userCommissionData.length === 0 && searchQuery) {
            req.flash('warning', 'There is no data found based on your search...');
        }

        // Render your EJS template with the userCommissionData
        res.status(200).render('admin/quantityBasedCommissionList', {
            userCommissionData,
            pagination,
            searchQuery,
            searchField,
            page,
            perPage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const editUserQuantityBasedCommissionListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10; // Adjust this value based on your preference
        const skip = (page - 1) * perPage;

        const editTargetUser = req.params.userId;

        // Initialize variables with default values
        let searchQuery = '';
        let searchField = '_id';

        if (req.query.search) {
            searchQuery = req.query.search;
        }
        if (req.query.searchField) {
            searchField = req.query.searchField;
        }

        let query = {
            user_id: editTargetUser,
        };

        if (searchQuery && searchField) {
            switch (searchField) {
                case '_id':
                    if (mongoose.Types.ObjectId.isValid(searchQuery)) {
                        query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery) };
                    } else {
                        req.flash('warning', 'Invalid ID.');
                    }
                    break;

                case 'commissionStatus':
                case 'remark':
                    query = { ...query, [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
                    break;

                case 'commissionAmount':
                    // Check if the entered value is a valid number
                    const commissionAmount = parseFloat(searchQuery);

                    if (isNaN(commissionAmount)) {
                        req.flash('warning', 'Invalid payment amount format. Please enter a valid number.');
                        return res.status(200).redirect('/admin/editUserQuantityBasedCommissionList');
                    }

                    query = { ...query, commissionAmount: commissionAmount };
                    break;

                case 'createdAt':
                case 'updatedAt':
                    const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
                    const startDate = new Date(searchQuery);

                    if (isNaN(startDate.getTime())) {
                        req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
                        return res.status(200).redirect('/admin/editUserQuantityBasedCommissionList');
                    }

                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);

                    query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
                    break;

                default:
                    req.flash('warning', 'Invalid search field.');
                    return res.status(200).redirect('/admin/editUserQuantityBasedCommissionList');
            }
        };

        const editTargetUsername = await User.findById(editTargetUser);

        const targetCommission = await QuantityBasedCommission
            .find(query)
            .populate({
                path: 'logisticsOrder_id',
                model: 'LogisticsOrder',
                select: '_id productQty'
            })
            .populate({
                path: 'user_id',
                model: 'User',
                select: '_id username'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage);

        let totalNotClaimedCommissionQty = 0;
        let totalNotClaimedCommissionAmount = 0;

        const totalTargetCommission = await QuantityBasedCommission.countDocuments(query);
        const totalPages = Math.ceil(totalTargetCommission / perPage);

        const pagination = {
            prev: page > 1 ? `/admin/editUserQuantityBasedCommissionList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            next: page < totalPages ? `/admin/editUserQuantityBasedCommissionList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            current: page,
            totalPages: totalPages,
        };

        if (targetCommission.length === 0 && searchQuery) {
            req.flash('warning', `There is no search data "${searchQuery}" in the "${searchField}" category from "${editTargetUsername.username}" user.`);
        } else if (targetCommission.length === 0 || !targetCommission) {
            req.flash('warning', `There is no Quantity-Based Commission yet from this "${editTargetUsername.username}" user.`);
        } else {
            for (const commission of targetCommission) {
                if (commission.commissionStatus === "Not Claimed") {
                    totalNotClaimedCommissionQty += commission.logisticsOrder_id.productQty;
                    totalNotClaimedCommissionAmount += commission.commissionAmount;
                }
            }
        }

        // Render your EJS template with the targetCommission
        res.status(200).render('admin/editUserQuantityBasedCommissionList', {
            targetCommission,
            editTargetUser,
            editTargetUsername,
            totalNotClaimedCommissionQty,
            totalNotClaimedCommissionAmount,
            pagination,
            searchQuery,
            searchField,
            page,
            perPage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const editUserQuantityBasedCommissionStatusList = async (req, res) => {
    try {
        const commissionIds = req.body.commissionId;
        const commissionStatuses = req.body.commissionStatus;

        // The reason of using this type of function to update data is because the ExpressJS will split the "ID" when its only have one row data.
        for (const i in req.body.commissionId) {
            const commissionId = req.body.commissionId[i];
            const commissionStatus = req.body.commissionStatus[i];

            // Check if the length of the current commissionId is 1
            if (commissionId.length === 1) {

                // Update the commission in the database
                await QuantityBasedCommission.findByIdAndUpdate(commissionIds, { commissionStatus: commissionStatuses });

            } else {

                // Update the commission in the database
                await QuantityBasedCommission.findByIdAndUpdate(commissionId, { $set: { commissionStatus } });

            }
        }

        res.status(201).redirect('/admin/quantityBasedCommissionList'); // Redirect to the page where the commissions are displayed
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const deliveryCommissionListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10; // Adjust this value based on your preference
        const skip = (page - 1) * perPage;

        // Initialize variables with default values
        let searchQuery = '';
        let searchField = '_id';

        // Initialize an array to store user and commission data
        const userCommissionData = [];

        if (req.query.search) {
            searchQuery = req.query.search;
        }
        if (req.query.searchField) {
            searchField = req.query.searchField;
        }

        let query = {
            // commissionStatus: searchCommissionStatusType
        };

        if (searchQuery && searchField) {
            switch (searchField) {
                case '_id':
                    if (mongoose.Types.ObjectId.isValid(searchQuery)) {
                        query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery) };
                    } else {
                        // If not a valid ObjectId, assume it's a user name
                        const userQuery = { username: new RegExp(searchQuery, 'i') };
                        const users = await User.find(userQuery, '_id');
                        const userIds = users.map(user => user._id);

                        if (userIds.length === 0) {
                            req.flash('warning', `No user found with the username "${searchQuery}".`);
                            return res.status(200).redirect('/admin/deliveryCommissionList');
                        }

                        query = { ...query, [searchField]: { $in: userIds } };
                    }
                    break;

                case 'role':
                    query = { [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
                    break;

                default:
                    req.flash('warning', 'Invalid search field.');
                    return res.status(200).redirect('/admin/deliveryCommissionList');
            }
        }

        const targetUser = await User
            .find(query)
            .skip(skip)
            .limit(perPage);;

        const totalTargetUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalTargetUsers / perPage);

        const pagination = {
            prev: page > 1 ? `/admin/deliveryCommissionList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            next: page < totalPages ? `/admin/deliveryCommissionList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            current: page,
            totalPages: totalPages,
        };

        // Iterate through each user to get commission data
        for (const user of targetUser) {
            const targetCommissions = await DeliveryCommission
                .find({
                    user_id: user._id,
                    commissionStatus: 'Not Claimed'
                })
                .populate({
                    path: 'delivery_id',
                    model: 'DeliveryList',
                    populate: {
                        path: 'logisticsOrder_id',
                        model: 'LogisticsOrder',
                        select: '_id productQty'
                    }
                });

            let totalNotClaimedCommissionProductQty = 0; // Initialize total quantity accumulator
            let totalNotClaimedCommissionAmount = 0;

            // Iterate through each commission for the user
            for (const commission of targetCommissions) {
                // Get LogisticsOrder by ID
                let getCurrentNotClaimedCommissionProductQty = await LogisticsOrder.findById(commission.delivery_id.logisticsOrder_id);
                let currentNotClaimedCommissionProductQty = getCurrentNotClaimedCommissionProductQty.productQty;

                // Add the productQty to the total quantity
                totalNotClaimedCommissionProductQty += currentNotClaimedCommissionProductQty;

                // Add the commissionAmount to the total amount
                totalNotClaimedCommissionAmount += commission.commissionAmount;
            }

            // Push user and commission data to the array
            userCommissionData.push({
                user_id: user._id,
                userRole: user.role,
                username: user.username,
                totalNotClaimedCommissionProductQty: totalNotClaimedCommissionProductQty,
                totalNotClaimedCommissionAmount: totalNotClaimedCommissionAmount
            });
        }


        if (userCommissionData.length === 0 && searchQuery) {
            req.flash('warning', 'There is no data found based on your search...');
        }

        // Render your EJS template with the userCommissionData
        res.status(200).render('admin/deliveryCommissionList', {
            userCommissionData,
            pagination,
            searchQuery,
            searchField,
            page,
            perPage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const editUserDeliveryCommissionListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10; // Adjust this value based on your preference
        const skip = (page - 1) * perPage;

        const editTargetUser = req.params.userId;

        // Initialize variables with default values
        let searchQuery = '';
        let searchField = '_id';

        if (req.query.search) {
            searchQuery = req.query.search;
        }
        if (req.query.searchField) {
            searchField = req.query.searchField;
        }

        let query = {
            user_id: editTargetUser,
        };

        if (searchQuery && searchField) {
            switch (searchField) {
                case '_id':
                    if (mongoose.Types.ObjectId.isValid(searchQuery)) {
                        query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery) };
                    } else {
                        req.flash('warning', 'Invalid ID.');
                    }
                    break;

                case 'commissionStatus':
                case 'remark':
                    query = { ...query, [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
                    break;

                case 'commissionAmount':
                    // Check if the entered value is a valid number
                    const commissionAmount = parseFloat(searchQuery);

                    if (isNaN(commissionAmount)) {
                        req.flash('warning', 'Invalid payment amount format. Please enter a valid number.');
                        return res.status(200).redirect('/admin/editUserDeliveryCommissionList');
                    }

                    query = { ...query, commissionAmount: commissionAmount };
                    break;

                case 'createdAt':
                case 'updatedAt':
                    const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
                    const startDate = new Date(searchQuery);

                    if (isNaN(startDate.getTime())) {
                        req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
                        return res.status(200).redirect('/admin/editUserDeliveryCommissionList');
                    }

                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);

                    query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
                    break;

                default:
                    req.flash('warning', 'Invalid search field.');
                    return res.status(200).redirect('/admin/editUserDeliveryCommissionList');
            }
        };

        const editTargetUsername = await User.findById(editTargetUser);

        const targetCommission = await DeliveryCommission
            .find(query)
            .populate({
                path: 'delivery_id',
                model: 'DeliveryList',
                populate: {
                    path: 'logisticsOrder_id',
                    model: 'LogisticsOrder',
                    select: '_id productQty'
                }
            })
            .populate({
                path: 'user_id',
                model: 'User',
                select: '_id username'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage);

        let totalNotClaimedCommissionQty = 0;
        let totalNotClaimedCommissionAmount = 0;

        const totalTargetCommission = await DeliveryCommission.countDocuments(query);
        const totalPages = Math.ceil(totalTargetCommission / perPage);

        const pagination = {
            prev: page > 1 ? `/admin/editUserDeliveryCommissionList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            next: page < totalPages ? `/admin/editUserDeliveryCommissionList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            current: page,
            totalPages: totalPages,
        };

        if (targetCommission.length === 0 && searchQuery) {
            req.flash('warning', `There is no search data "${searchQuery}" in the "${searchField}" category from "${editTargetUsername.username}" user.`);
        } else if (targetCommission.length === 0 || !targetCommission) {
            req.flash('warning', `There is no Quantity-Based Commission yet from this "${editTargetUsername.username}" user.`);
        } else {
            for (const commission of targetCommission) {
                if (commission.commissionStatus === "Not Claimed") {
                    totalNotClaimedCommissionQty += commission.delivery_id.logisticsOrder_id.productQty;
                    totalNotClaimedCommissionAmount += commission.commissionAmount;
                }
            }
        }

        // Render your EJS template with the targetCommission
        res.status(200).render('admin/editUserDeliveryCommissionList', {
            targetCommission,
            editTargetUser,
            editTargetUsername,
            totalNotClaimedCommissionQty,
            totalNotClaimedCommissionAmount,
            pagination,
            searchQuery,
            searchField,
            page,
            perPage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const editUserDeliveryCommissionStatusList = async (req, res) => {
    try {
        const commissionIds = req.body.commissionId;
        const commissionStatuses = req.body.commissionStatus;

        // The reason of using this type of function to update data is because the ExpressJS will split the "ID" when its only have one row data.
        for (const i in req.body.commissionId) {
            const commissionId = req.body.commissionId[i];
            const commissionStatus = req.body.commissionStatus[i];

            // Check if the length of the current commissionId is 1
            if (commissionId.length === 1) {

                // Update the commission in the database
                await DeliveryCommission.findByIdAndUpdate(commissionIds, { commissionStatus: commissionStatuses });

            } else {

                // Update the commission in the database
                await DeliveryCommission.findByIdAndUpdate(commissionId, { $set: { commissionStatus } });

            }
        }

        res.status(201).redirect('/admin/deliveryCommissionList'); // Redirect to the page where the commissions are displayed
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    quantityBasedCommissionListPage,
    editUserQuantityBasedCommissionListPage,
    editUserQuantityBasedCommissionStatusList,
    deliveryCommissionListPage,
    editUserDeliveryCommissionListPage,
    editUserDeliveryCommissionStatusList,

}