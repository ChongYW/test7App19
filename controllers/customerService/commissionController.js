const LogisticsOrder = require('../../models/logisticsOrderModel');
const User = require('../../models/userModel');
const DeliveryList = require('../../models/deliveryListModel');
const QuantityBasedCommission = require('../../models/quantityBasedCommissionModel');
const DeliveryCommission = require('../../models/deliveryCommissionModel');
const mongoose = require('mongoose');
const flash = require('express-flash');

const quantityBasedCommissionHistoryListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10; // Adjust this value based on your preference
        const skip = (page - 1) * perPage;

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
            user_id: req.user._id,
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
                        return res.status(200).redirect('/customerService/quantityBasedCommissionHistoryList');
                    }

                    query = { ...query, commissionAmount: commissionAmount };
                    break;

                case 'createdAt':
                case 'updatedAt':
                    const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
                    const startDate = new Date(searchQuery);

                    if (isNaN(startDate.getTime())) {
                        req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
                        return res.status(200).redirect('/customerService/quantityBasedCommissionHistoryList');
                    }

                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);

                    query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
                    break;

                default:
                    req.flash('warning', 'Invalid search field.');
                    return res.status(200).redirect('/customerService/quantityBasedCommissionHistoryList');
            }
        };

        const username = req.user.username;

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
            prev: page > 1 ? `/customerService/quantityBasedCommissionHistoryList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            next: page < totalPages ? `/customerService/quantityBasedCommissionHistoryList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            current: page,
            totalPages: totalPages,
        };

        if (targetCommission.length === 0 && searchQuery) {
            req.flash('warning', `There is no search data "${searchQuery}" in the "${searchField}" category.`);
        } else if (targetCommission.length === 0 || !targetCommission) {
            req.flash('warning', `There is no Quantity-Based Commission history yet...`);
        } else {
            for (const commission of targetCommission) {
                if (commission.commissionStatus === "Not Claimed") {
                    totalNotClaimedCommissionQty += commission.logisticsOrder_id.productQty;
                    totalNotClaimedCommissionAmount += commission.commissionAmount;
                }
            }
        }

        // Render your EJS template with the targetCommission
        res.status(200).render('customerService/quantityBasedCommissionHistoryList', {
            targetCommission,
            username,
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

const deliveryCommissionListHistoryPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10; // Adjust this value based on your preference
        const skip = (page - 1) * perPage;

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
            user_id: req.user._id,
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
                        return res.status(200).redirect('/customerService/deliveryCommissionHistoryList');
                    }

                    query = { ...query, commissionAmount: commissionAmount };
                    break;

                case 'createdAt':
                case 'updatedAt':
                    const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
                    const startDate = new Date(searchQuery);

                    if (isNaN(startDate.getTime())) {
                        req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
                        return res.status(200).redirect('/customerService/deliveryCommissionHistoryList');
                    }

                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);

                    query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
                    break;

                default:
                    req.flash('warning', 'Invalid search field.');
                    return res.status(200).redirect('/customerService/deliveryCommissionHistoryList');
            }
        };

        const username = req.user.username;

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
            prev: page > 1 ? `/customerService/deliveryCommissionHistoryList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            next: page < totalPages ? `/customerService/deliveryCommissionHistoryList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
            current: page,
            totalPages: totalPages,
        };

        if (targetCommission.length === 0 && searchQuery) {
            req.flash('warning', `There is no search data "${searchQuery}" in the "${searchField}" category from "${editTargetUsername.username}" user.`);
        } else if (targetCommission.length === 0 || !targetCommission) {
            req.flash('warning', `There is no Quantity-Based Commission yet...`);
        } else {
            for (const commission of targetCommission) {
                if (commission.commissionStatus === "Not Claimed") {
                    totalNotClaimedCommissionQty += commission.delivery_id.logisticsOrder_id.productQty;
                    totalNotClaimedCommissionAmount += commission.commissionAmount;
                }
            }
        }

        // Render your EJS template with the targetCommission
        res.status(200).render('customerService/deliveryCommissionHistoryList', {
            targetCommission,
            username,
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

module.exports = {
    quantityBasedCommissionHistoryListPage,
    deliveryCommissionListHistoryPage,
}