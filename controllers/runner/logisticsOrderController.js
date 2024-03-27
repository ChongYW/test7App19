const LogisticsOrder = require('../../models/logisticsOrderModel');
const User = require('../../models/userModel');
const DeliveryList = require('../../models/deliveryListModel');
const QuantityBasedCommission = require('../../models/quantityBasedCommissionModel');
const DeliveryCommission = require('../../models/deliveryCommissionModel');
const validator = require('validator');
const paginate = require('express-paginate');
const mongoose = require('mongoose');

const logisticsOrderFeedPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 9; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    // Initialize variables with default values
    let searchQuery = '';
    let searchField = '_id';
    let searchStatusField = 'Order Posted to Feed';

    const currentDateTime = new Date(); // This represents the current date and time

    // Calculate 5 minutes ago
    const fiveMinutesAgo = new Date(currentDateTime - 5 * 60 * 1000);

    if (req.query.search) {
      searchQuery = req.query.search;
    }

    if (req.query.searchField) {
      searchField = req.query.searchField;
    }

    if (req.query.searchStatusField) {
      searchStatusField = req.query.searchStatusField;
    }

    let query = {
      status: searchStatusField,
      updatedAt: { $lte: fiveMinutesAgo },
    };

    // Need to adjust the search range to userB and userC.
    if (searchQuery && searchField) {
      switch (searchField) {
        case 'paymentAmount':
          // Check if the entered value is a valid number
          const paymentAmount = parseFloat(searchQuery);

          if (isNaN(paymentAmount)) {
            req.flash('warning', 'Invalid payment amount format. Please enter a valid number.');
            return res.status(200).redirect('/runner/logisticsOrderList');
          }

          query = { ...query, paymentAmount: paymentAmount };
          break;

        case '_id':
          // Check if the entered value is a valid ObjectId
          if (mongoose.Types.ObjectId.isValid(searchQuery)) {
            query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery), status: searchStatusField };
          } else {
            req.flash('warning', `Invalid ObjectId format for ${searchField}.`);
            return res.status(200).redirect('/runner/logisticsOrderFeed');
          }
          break;

        case 'createdByUser':
          // Check if the entered value is a valid ObjectId
          if (mongoose.Types.ObjectId.isValid(searchQuery)) {
            query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery), status: searchStatusField };
          } else {
            // If not a valid ObjectId, assume it's a user name
            const userQuery = { username: new RegExp(searchQuery, 'i') };
            const users = await User.find(userQuery, '_id');
            const userIds = users.map(user => user._id);

            if (userIds.length === 0) {
              req.flash('warning', `No user found with the username "${searchQuery}".`);
              return res.status(200).redirect('/runner/logisticsOrderFeed');
            }

            query = { ...query, [searchField]: { $in: userIds }, status: searchStatusField };
          }
          break;

        // Your existing cases for different search fields
        case 'status':
        case 'description':
        case 'customerType':
        case 'customerName':
        case 'customerContact':
        case 'address.address1':
        case 'address.address2':
        case 'address.city':
        case 'address.postalCode':
        case 'address.country':
        case 'productQty':
        case 'paymentStatus':
        case 'paymentType':
        case 'deliveryType':
        case 'remark':
          query = { ...query, [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
          break;

        case 'createdAt':
        case 'updatedAt':
          const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
          const startDate = new Date(searchQuery);

          if (isNaN(startDate.getTime())) {
            req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
            return res.status(200).redirect('/runner/logisticsOrderFeed');
          }

          startDate.setHours(0, 0, 0, 0);

          // Adjust endDate to be 5 minutes less than the current time
          const endDate = new Date();
          endDate.setMinutes(endDate.getMinutes() - 5);

          query = { ...query, [dateField]: { $gte: startDate, $lte: endDate.toISOString() } };
          break;

        // Other cases for different search fields

        default:
          req.flash('warning', 'Invalid search field.');
          return res.status(200).redirect('/runner/logisticsOrderFeed');
      }
    }

    const logisticsOrders = await LogisticsOrder
      .find(query)
      .populate('createdByUser', 'username') // Populate the createdByUser field with the 'username' field
      .sort({ createdAt: 1 }) // Sort by createdAt in ascending order (oldest first)
      .skip(skip)
      .limit(perPage);

    const totalLogisticsOrders = await LogisticsOrder.countDocuments(query);
    const totalPages = Math.ceil(totalLogisticsOrders / perPage);

    const pagination = {
      prev: page > 1 ? `/runner/logisticsOrderFeed?page=${page - 1}&search=${searchQuery || ''}&searchStatusField=${searchStatusField || ''}&searchField=${searchField || ''}` : null,
      next: page < totalPages ? `/runner/logisticsOrderFeed?page=${page + 1}&search=${searchQuery || ''}&searchStatusField=${searchStatusField || ''}&searchField=${searchField || ''}` : null,
      current: page,
      totalPages: totalPages,
    };

    if (logisticsOrders.length === 0 && searchQuery) {
      req.flash('warning', `No logistics order found based on the input "${searchQuery}" for the field "${searchStatusField}" with "${searchField}".`);
    } else if (logisticsOrders.length === 0) {
      req.flash('warning', `No order feeds yet...`);
    }

    res.status(200).render('runner/logisticsOrderFeed', {
      logisticsOrders,
      pagination,
      searchQuery,
      searchField,
      searchStatusField,
      page,
      perPage,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const logisticsOrderDetailsPage = async (req, res) => {
  try {
    const logisticsOrder = await LogisticsOrder
      .findById(req.params.logisticsOrderId)
      .populate('createdByUser', 'username');

    if (logisticsOrder) {
      return res.status(200).render('runner/logisticsOrderDetails', { logisticsOrder })
    }

    req.flash('error', 'Something wrong, please try again...');
    return res.status(422).redirect('/runner/logisticsOrderFeed');

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const addToDeliveryList = async (req, res) => {

  try {
    const logisticsOrder = await LogisticsOrder.findById(req.params.logisticsOrderId);

    if (logisticsOrder && logisticsOrder.status === 'Order Posted to Feed') {

      await LogisticsOrder.findByIdAndUpdate(
        req.params.logisticsOrderId,
        { $set: { status: 'Added to Delivery List' } },
        { new: true } // Set to true to return the updated document
      );

      const addToDeliveryList = new DeliveryList({
        logisticsOrder_id: req.params.logisticsOrderId,
        user_id: req.user._id
      });

      await addToDeliveryList.save();

      req.flash('success', `The logistics order is added to your "DeliveryList" successfully!`);

    } else if (logisticsOrder && !logisticsOrder.status === 'Added to Delivery List') {
      req.flash('warning', 'The logistics order is taken by other, try another.');
    } else {
      req.flash('error', 'The logistics order is not found, try another.');
    }

    res.status(201).redirect('/runner/logisticsOrderFeed');

  } catch (error) {
    // req.flash('error', error)
    console.error(error);
    // res.status(500).render('somethingWrong');
    res.status(500).send('Internal Server Error');
  }
};

const deliveryListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 9; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    const logisticsOrders = await LogisticsOrder
      .find({
        status: 'Added to Delivery List'
      });

    // Get the IDs of these logistics orders
    const logisticsOrderIds = logisticsOrders.map(order => order._id);

    // Find delivery lists for the user and matching logistics orders
    const thisUserValidDeliveryList = await DeliveryList
      .find({
        user_id: req.user._id,
        logisticsOrder_id: { $in: logisticsOrderIds }
      })
      .populate({
        path: 'logisticsOrder_id',
        model: 'LogisticsOrder',
        select: 'createdByUser status description customerType customerName customerContact address productQty paymentStatus paymentType paymentAmount deliveryType remark',
        populate: {
          path: 'createdByUser',
          model: 'User',
          select: 'username'
        }
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status' // Select only the fields you want from User
      })
      .skip(skip)
      .limit(perPage);

    if (!thisUserValidDeliveryList.length) {
      req.flash('warning', 'Your "Delivery List" is empty, go add it from "Logistics Order Feed" it will show up here!');
    }

    const totalThisUserValidDeliveryList = await DeliveryList
      .countDocuments({
        user_id: req.user._id,
        logisticsOrder_id: { $in: logisticsOrderIds }
      });

    const totalPages = Math.ceil(totalThisUserValidDeliveryList / perPage);

    const pagination = {
      prev: page > 1 ? `/runner/deliveryList?page=${page - 1}` : null,
      next: page < totalPages ? `/runner/deliveryList?page=${page + 1}` : null,
      current: page,
      totalPages: totalPages,
    };

    res.status(200).render('runner/deliveryList', {
      thisUserValidDeliveryList,
      pagination,
      page,
      perPage,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const deliveryDetailsPage = async (req, res) => {
  try {
    const delivery = await DeliveryList
      .findById(req.params.deliveryId)
      .where({
        user_id: req.user._id,
      })
      .populate({
        path: 'logisticsOrder_id',
        model: 'LogisticsOrder',
        match: { status: 'Added to Delivery List' },
        select: 'createdByUser status description customerType customerName customerContact address productQty paymentStatus paymentType paymentAmount deliveryType remark',
        populate: {
          path: 'createdByUser',
          model: 'User',
          select: 'username'
        }
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status'
      });

    if (delivery) {
      return res.status(200).render('runner/deliveryDetails', { delivery })
    }

    req.flash('error', 'Something wrong, please try again...');
    return res.status(422).redirect('/runner/deliveryList');

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const removeFromDeliveryList = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;
    const delivery = await DeliveryList.findById(deliveryId);
    const updateLogisticOrderStatus = await LogisticsOrder.findByIdAndUpdate(
      delivery.logisticsOrder_id,
      {
        status: 'Order Posted to Feed',
      }
    );

    await updateLogisticOrderStatus.save();
    // Remove user from the database
    await DeliveryList.findByIdAndDelete(delivery._id);

    req.flash('success', 'Remove from your "Delivery List" successfully!')
    return res.status(201).redirect('/runner/deliveryList');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const startDeliver = async (req, res) => {
  try {

    const thisUserDeliveryList = await DeliveryList.find({ user_id: req.user._id }, '_id')
      .populate({
        path: 'logisticsOrder_id',
        model: 'LogisticsOrder',
        match: { status: 'Added to Delivery List' }, // Add the condition here
        select: 'status description customerType customerName customerContact address productQty paymentStatus paymentType paymentAmount deliveryType remark'
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status' // Select only the fields you want from User
      });

    if (!thisUserDeliveryList.length) {
      req.flash('warning', 'Your "Start Deliver List" is empty, go add it from "Delivery List" it will show up here!');
      return res.status(200).redirect('/runner/deliveryList');
    }

    for (let i = 0; i < thisUserDeliveryList.length; i++) {

      const logisticsOrderId = thisUserDeliveryList[i].logisticsOrder_id;

      const targetLogisticOrder = await LogisticsOrder.findById(logisticsOrderId);

      // Check if logisticsOrder is not null or undefined
      if (targetLogisticOrder && targetLogisticOrder.status === 'Added to Delivery List') {
        const updatedStatus = await LogisticsOrder.findByIdAndUpdate(
          targetLogisticOrder._id,
          {
            status: 'Delivery in Progress',
          }
        );

        await updatedStatus.save();
      }

    };

    // console.log(thisUserValidDeliveryList);
    req.flash('success', 'Delivery mode is started, please ensure the traffic safety of yourself and others. Good luck!');
    return res.status(201).redirect('/runner/startDeliverList');

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
    // req.flash('error', error)
    // return res.redirect('somethingWrong');
  }
}

const startDeliverListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 9; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    const logisticsOrders = await LogisticsOrder
      .find({
        status: 'Delivery in Progress'
      });

    // Get the IDs of these logistics orders
    const logisticsOrderIds = logisticsOrders.map(order => order._id);

    // Find delivery lists for the user and matching logistics orders
    const thisUserValidDeliveryList = await DeliveryList
      .find({
        user_id: req.user._id,
        logisticsOrder_id: { $in: logisticsOrderIds }
      })
      .populate({
        path: 'logisticsOrder_id',
        model: 'LogisticsOrder',
        select: 'createdByUser status description customerType customerName customerContact address productQty paymentStatus paymentType paymentAmount deliveryType remark',
        populate: {
          path: 'createdByUser',
          model: 'User',
          select: 'username'
        }
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status' // Select only the fields you want from User
      })
      .skip(skip)
      .limit(perPage);

    if (!thisUserValidDeliveryList.length) {
      req.flash('warning', 'Your "Start Delivery List" is empty, go "Delivery List" and click "Start deliver" it will show up here.');
    }

    const totalThisUserValidDeliveryList = await DeliveryList
      .countDocuments({
        user_id: req.user._id,
        logisticsOrder_id: { $in: logisticsOrderIds }
      });

    const totalPages = Math.ceil(totalThisUserValidDeliveryList / perPage);

    const pagination = {
      prev: page > 1 ? `/runner/startDeliverList?page=${page - 1}` : null,
      next: page < totalPages ? `/runner/startDeliverList?page=${page + 1}` : null,
      current: page,
      totalPages: totalPages,
    };

    // console.log(thisUserValidDeliveryList);
    return res.status(200).render('runner/startDeliverList', {
      thisUserValidDeliveryList,
      pagination,
      page,
      perPage,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
    // req.flash('error', error)
    // return res.redirect('somethingWrong');
  }
}

const logisticsOrderDetailsAndActionsPage = async (req, res) => {
  try {
    const delivery = await DeliveryList
      .findById(req.params.deliveryId)
      .where({
        user_id: req.user._id,
      })
      .populate({
        path: 'logisticsOrder_id',
        model: 'LogisticsOrder',
        match: { status: 'Delivery in Progress' },
        select: 'createdByUser status description customerType customerName customerContact address productQty paymentStatus paymentType paymentAmount deliveryType remark',
        populate: {
          path: 'createdByUser',
          model: 'User',
          select: 'username'
        }
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status'
      });

    const CODPaymentAmount = delivery.logisticsOrder_id.paymentAmount;

    if (delivery) {
      return res.status(200).render('runner/logisticsOrderDetailsAndActions',
        {
          delivery
        });
    }

    req.flash('error', 'Something wrong, please try again...');
    return res.status(500).redirect('/runner/startDeliverList');

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const logisticsOrderDetailsAndActions = async (req, res) => {
  try {
    const quantityBasedCommissionForNewCustomerAmount = 20;
    const quantityBasedCommissionForRepeatOrderAmount = 30;
    let totalCurrentLogisticOrderCommissionAmount = 0;

    const deliveryCommissionAmount = 10;
    let totalCurrentRunnerLogisticOrderCommissionAmount = 0;

    let isValid = true;
    const deliveryId = req.params.deliveryId;
    const {
      status,
      receivedPayment
    } = req.body;

    // Handle other updates for the LogisticsOrder (e.g., updating status, description, etc.)
    const allowedStatusValue = [
      'Delivered Successfully',
      'Returning',
      'Delivery Attempted',
      'Cancel Delivery',
    ];
    if (!allowedStatusValue.includes(status)) {
      isValid = false;
      req.flash('error', 'Invalid status.');
    }

    if (receivedPayment && receivedPayment === 'none') {
      isValid = false;
      req.flash('error', 'Is "COD" payment type, please make sure you are reciving the payment!');
    }

    if (isValid) {
      const delivery = await DeliveryList
        .findById(deliveryId)
        .where({
          user_id: req.user._id,
        });

      if (delivery) {
        const updatedStatus = await LogisticsOrder.findByIdAndUpdate(
          delivery.logisticsOrder_id,
          {
            status: status,
          },
          { new: true }
        );

        if (status === 'Delivered Successfully') {
          if (updatedStatus.customerType === 'New customer') {
            totalCurrentLogisticOrderCommissionAmount = updatedStatus.productQty * quantityBasedCommissionForNewCustomerAmount;
            totalCurrentRunnerLogisticOrderCommissionAmount = updatedStatus.productQty * deliveryCommissionAmount;

          } else if (updatedStatus.customerType === 'Repeat Order') {
            totalCurrentLogisticOrderCommissionAmount = updatedStatus.productQty * quantityBasedCommissionForRepeatOrderAmount;
            totalCurrentRunnerLogisticOrderCommissionAmount = updatedStatus.productQty * deliveryCommissionAmount;
          }

          console.log("This is receivedPayment:", receivedPayment);

          if (receivedPayment && (receivedPayment === 'yes' || receivedPayment === 'no')) {
            const updatedDeliveryReceivedPayment = await DeliveryList.findByIdAndUpdate(
              deliveryId,
              {
                receivedPayment: receivedPayment
              }
            );

            await updatedDeliveryReceivedPayment.save();
          }

          const createDeliveryCommission = new DeliveryCommission({
            delivery_id: delivery._id,
            user_id: req.user._id,
            commissionStatus: 'Not Claimed',
            commissionAmount: totalCurrentRunnerLogisticOrderCommissionAmount,
          });

          const createQuantityBasedCommission = new QuantityBasedCommission({
            logisticsOrder_id: updatedStatus._id,
            user_id: updatedStatus.createdByUser,
            commissionStatus: 'Not Claimed',
            commissionAmount: totalCurrentLogisticOrderCommissionAmount,
          });

          await createDeliveryCommission.save();
          await createQuantityBasedCommission.save();
        }


        await updatedStatus.save();

      } else {

        req.flash('error', 'Something wrong, please try again later or ask the order creator for help!');
        return res.status(500).redirect('/runner/startDeliverList/logisticsOrderDetailsAndActions/' + deliveryId);
      };

      req.flash('success', 'Updated success!');

    } else {

      req.flash('warning', 'There are some field is invalid!');
      return res.status(422).redirect('/runner/startDeliverList/logisticsOrderDetailsAndActions/' + deliveryId);

    }

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }

  return res.status(201).redirect('/runner/startDeliverList');
}

module.exports = {
  logisticsOrderFeedPage,
  logisticsOrderDetailsPage,
  addToDeliveryList,
  deliveryListPage,
  deliveryDetailsPage,
  removeFromDeliveryList,
  startDeliver,
  startDeliverListPage,
  logisticsOrderDetailsAndActionsPage,
  logisticsOrderDetailsAndActions,
};
