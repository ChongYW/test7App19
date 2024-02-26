const LogisticsOrder = require('../../models/logisticsOrderModel');
const User = require('../../models/userModel');
const DeliveryList = require('../../models/deliveryListModel')
const validator = require('validator');
const paginate = require('express-paginate');
const mongoose = require('mongoose');


// const logisticsOrderListPage = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const perPage = 10; // Adjust this value based on your preference
//     const skip = (page - 1) * perPage;

//     let query = {
//       createdByUser: req.user._id,
//     };
//     const searchQuery = req.query.search;
//     const searchField = req.query.searchField;

//     if (searchQuery && searchField) {
//       switch (searchField) {
//         case 'paymentAmount':
//           // Check if the entered value is a valid number
//           const paymentAmount = parseFloat(searchQuery);

//           if (isNaN(paymentAmount)) {
//             req.flash('warning', 'Invalid payment amount format. Please enter a valid number.');
//             return res.redirect('/runner/logisticsOrderList');
//           }

//           query = { ...query, paymentAmount: paymentAmount };
//           break;

//         case '_id':
//         case 'createdByUser':
//           // Check if the entered value is a valid ObjectId
//           if (mongoose.Types.ObjectId.isValid(searchQuery)) {
//             query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery) }; // The `searchField` is need to be same as the DB target search field!
//           } else {
//             req.flash('warning', `Invalid ObjectId format for ${searchField}.`);
//             return res.redirect('/runner/logisticsOrderList');
//           }
//           break;

//         case 'status':
//         case 'description':
//         case 'customerType':
//         case 'customerName':
//         case 'customerContact':
//         case 'address.address1':
//         case 'address.address2':
//         case 'address.city':
//         case 'address.postalCode':
//         case 'address.country':
//         case 'paymentStatus':
//         case 'paymentType':
//         case 'deliveryType':
//         case 'remark':
//           query = { ...query, [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
//           break;
//         case 'createdAt':
//         case 'updatedAt':
//           const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
//           const startDate = new Date(searchQuery);

//           if (isNaN(startDate.getTime())) {
//             req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
//             return res.redirect('/runner/logisticsOrderList');
//           }

//           startDate.setHours(0, 0, 0, 0);
//           const endDate = new Date(startDate);
//           endDate.setHours(23, 59, 59, 999);

//           query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
//           break;
//         default:
//           req.flash('warning', 'Invalid search field.');
//           return res.redirect('/runner/logisticsOrderList');
//       }
//     }

//     const logisticsOrders = await LogisticsOrder.find(query)
//       .sort({ createdAt: -1 })  // Sort by createdAt in descending order (newest first)
//       .skip(skip)
//       .limit(perPage);
//     const totalLogisticsOrders = await LogisticsOrder.countDocuments(query);
//     const totalPages = Math.ceil(totalLogisticsOrders / perPage);

//     const pagination = {
//       prev: page > 1 ? `/runner/logisticsOrderList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
//       next: page < totalPages ? `/runner/logisticsOrderList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
//       current: page,
//       totalPages: totalPages,
//     };

//     if (logisticsOrders.length === 0 && searchQuery) {
//       req.flash('warning', `No logistics order found based on the input "${searchQuery}" for the field "${searchField}".`);
//     }

//     res.render('runner/logisticsOrderList', {
//       logisticsOrders,
//       pagination,
//       searchQuery,
//       searchField,
//       page,
//       perPage,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };

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
            return res.redirect('/runner/logisticsOrderList');
          }

          query = { ...query, paymentAmount: paymentAmount };
          break;

        case '_id':
          // Check if the entered value is a valid ObjectId
          if (mongoose.Types.ObjectId.isValid(searchQuery)) {
            query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery), status: searchStatusField };
          } else {
            req.flash('warning', `Invalid ObjectId format for ${searchField}.`);
            return res.redirect('/runner/logisticsOrderFeed');
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
              return res.redirect('/runner/logisticsOrderFeed');
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
            return res.redirect('/runner/logisticsOrderFeed');
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
          return res.redirect('/runner/logisticsOrderFeed');
      }
    }

    const logisticsOrders = await LogisticsOrder.find(query)
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
    }

    res.render('runner/logisticsOrderFeed', {
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
      return res.render('runner/logisticsOrderDetails', { logisticsOrder })
    }

    req.flash('error', 'Something wrong, please try again...');
    return res.redirect('/runner/logisticsOrderFeed');

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

    res.redirect('/runner/logisticsOrderFeed');

  } catch (error) {
    req.flash('error', error)
    console.error(error);
    res.status(500).render('somethingWrong');
  }
};

const deliveryListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 9; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    let thisUserValidDeliveryList = [];

    const thisUserDeliveryList = await DeliveryList.find({ user_id: req.user._id }, '_id')
      .populate({
        path: 'logisticsOrder_id',
        model: 'LogisticsOrder',
        match: { status: 'Added to Delivery List' }, // Add the condition here
        select: 'status description customerType customerName customerContact address paymentStatus paymentType paymentAmount deliveryType remark'
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status' // Select only the fields you want from User
      })
      .skip(skip)
      .limit(perPage);

    for (let i = 0; i < thisUserDeliveryList.length; i++) {

      const logisticsOrder = thisUserDeliveryList[i].logisticsOrder_id;

      // Check if logisticsOrder is not null or undefined
      if (logisticsOrder && logisticsOrder.status === 'Added to Delivery List') {
        thisUserValidDeliveryList.push(thisUserDeliveryList[i]);
      }

    }

    if (!thisUserValidDeliveryList.length) {
      req.flash('warning', 'Your "Delivery List" is empty, go add it from "Logistics Order Feed" it will show up here!');
    }

    const totalThisUserValidDeliveryList = await DeliveryList.countDocuments(thisUserValidDeliveryList);

    const totalPages = Math.ceil(totalThisUserValidDeliveryList / perPage);

    const pagination = {
      prev: page > 1 ? `/runner/deliveryList?page=${page - 1}` : null,
      next: page < totalPages ? `/runner/deliveryList?page=${page + 1}` : null,
      current: page,
      totalPages: totalPages,
    };

    // console.log(thisUserValidDeliveryList);
    res.render('runner/deliveryList', {
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
        match: { status: 'Added to Delivery List' }, // Add the condition here
        select: 'status description customerType customerName customerContact address paymentStatus paymentType paymentAmount deliveryType remark'
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status'
      });

    if (delivery) {
      return res.render('runner/deliveryDetails', { delivery })
    }

    req.flash('error', 'Something wrong, please try again...');
    return redirect('/runner/deliveryList');

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
    res.redirect('/runner/deliveryList');
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
        select: 'status description customerType customerName customerContact address paymentStatus paymentType paymentAmount deliveryType remark'
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status' // Select only the fields you want from User
      });

    if (!thisUserDeliveryList.length) {
      req.flash('warning', 'Your "Start Deliver List" is empty, go add it from "Delivery List" it will show up here!');
      return res.redirect('/runner/deliveryList');
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
    return res.redirect('/runner/startDeliverList');

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

    let thisUserValidDeliveryList = [];

    const thisUserDeliveryList = await DeliveryList.find({ user_id: req.user._id }, '_id')
      .populate({
        path: 'logisticsOrder_id',
        model: 'LogisticsOrder',
        match: { status: 'Delivery in Progress' }, // Add the condition here
        select: 'status description customerType customerName customerContact address paymentStatus paymentType paymentAmount deliveryType remark'
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status' // Select only the fields you want from User
      })
      .skip(skip)
      .limit(perPage);

    for (let i = 0; i < thisUserDeliveryList.length; i++) {

      const logisticsOrder = thisUserDeliveryList[i].logisticsOrder_id;

      // Check if logisticsOrder is not null or undefined
      if (logisticsOrder && logisticsOrder.status === 'Delivery in Progress') {
        thisUserValidDeliveryList.push(thisUserDeliveryList[i]);
      }

    }

    if (!thisUserValidDeliveryList.length) {
      req.flash('warning', 'Your "Start Delivery List" is empty, go click "Start deliver" at "Delivery List" it will show up here!');
      return res.redirect('/runner/deliveryList');
    }

    const totalThisUserValidDeliveryList = await DeliveryList.countDocuments(thisUserValidDeliveryList);

    const totalPages = Math.ceil(totalThisUserValidDeliveryList / perPage);

    const pagination = {
      prev: page > 1 ? `/runner/startDeliverList?page=${page - 1}` : null,
      next: page < totalPages ? `/runner/startDeliverList?page=${page + 1}` : null,
      current: page,
      totalPages: totalPages,
    };

    // console.log(thisUserValidDeliveryList);
    return res.render('runner/startDeliverList', {
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
        match: { status: 'Delivery in Progress' }, // Add the condition here
        select: 'status description customerType customerName customerContact address paymentStatus paymentType paymentAmount deliveryType remark'
      })
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username phone email role status'
      });

    if (delivery) {
      return res.render('runner/logisticsOrderDetailsAndActions', { delivery })
    }

    req.flash('error', 'Something wrong, please try again...');
    return redirect('/runner/startDeliverList');

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const logisticsOrderDetailsAndActions = async (req, res) => {
  try {
    let isValid = true;
    const deliveryId = req.params.deliveryId;
    const { status } = req.body;

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
          }
        );

        await updatedStatus.save();
      } else {

        req.flash('error', 'Something wrong, please try again later or ask the order creator for help!');
        return res.redirect('/runner/startDeliverList/logisticsOrderDetailsAndActions/' + deliveryId);
      };

      req.flash('success', 'Updated success!');

    } else {

      req.flash('warning', 'The status field is invalid!');
      return res.redirect('/runner/startDeliverList/logisticsOrderDetailsAndActions/' + deliveryId);

    }

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }

  return res.redirect('/runner/startDeliverList');
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
