const LogisticsOrder = require('../../models/logisticsOrderModel');
const User = require('../../models/userModel');
const DeliveryList = require('../../models/deliveryListModel');
const QuantityBasedCommission = require('../../models/quantityBasedCommissionModel');
const DeliveryCommission = require('../../models/deliveryCommissionModel');
const validator = require('validator');
const paginate = require('express-paginate');
const mongoose = require('mongoose');

const createLogisticsOrderPage = (req, res) => {

  const customerType = "New Customer";
  const paymentType = "Online Transfer";

  res.status(200).render('customerService/createLogisticsOrder',
    {
      customerType,
      paymentType
    }
  );
};

// Need to change it only show the create by current user "Logistics Order Pending List".
const createLogisticsOrder = async (req, res) => {
  // Extract address details
  const {
    description,
    customerType,
    customerName,
    customerContact,
    allowEmptyAddress,
    address1, address2, city, postalCode, country,
    productQty,
    paymentStatus,
    paymentType,
    paymentAmount,
    deliveryType,
    thirdPartyTrackingCode,
    remark
  } = req.body;

  try {
    if (allowEmptyAddress === 'yes' && (!address1.trim() && !address2.trim() && !city.trim() && !postalCode.trim() && !country.trim())) {
      const emptyAddress = 'Order creator left it empty.';
      let isValid = true;

      if (!description.trim()) {
        isValid = false;
        req.flash('error', 'If you choose "Allow empty address", description must be filled in.');
      }

      const allowedCustomerTypeValue = [
        'New Customer',
        'Repeat Order',
      ];
      if (!allowedCustomerTypeValue.includes(customerType)) {
        isValid = false;
        req.flash('error', 'Invalid Customer Type.');
      }
      if (customerType === "Repeat Order") {
        const existCustomer = await LogisticsOrder.find({
          createdByUser: req.user._id,
          customerName: customerName,
          customerContact: customerContact
        });

        if (existCustomer.length > 0) {
          isValid = true;
        } else {
          isValid = false;
          req.flash('error', 'No repeat customer found, "Customer Name" and "Customer Contact" must exist.');
        }
      } else {
        if (customerContact.length < 11 || customerContact.length > 12 || !validator.isMobilePhone(customerContact, 'any', { strictMode: false })) {
          isValid = false;
          req.flash('error', 'Invalid phone number.');
        }

        const existCustomerContact = await LogisticsOrder.find({
          customerContact: customerContact,
        });

        if (existCustomerContact.length > 0) {
          isValid = false;
          req.flash('error', 'Customer Contact exist.');
        }
      }

      if (!customerName.trim()) {
        isValid = false;
        req.flash('error', 'Customer Name must be filled in.');
      }

      if (!productQty.trim()) {
        isValid = false;
        req.flash('error', 'Product Quantity must be filled in.');
      }

      if (!paymentStatus.trim()) {
        isValid = false;
        req.flash('error', 'Payment Status must be filled in.');
      }

      const allowedPaymentTypeValue = [
        'Online Transfer',
        'COD',
        'KOL',
        'Sample',
      ];
      if (!allowedPaymentTypeValue.includes(paymentType)) {
        isValid = false;
        req.flash('error', 'Invalid Payment Type.');
      }

      if (!paymentAmount.trim()) {
        isValid = false;
        req.flash('error', 'Payment Amount must be filled in.');
      }

      if (!deliveryType.trim()) {
        isValid = false;
        req.flash('error', 'Delivery Type must be filled in.');
      }

      if (!thirdPartyTrackingCode.trim()) {
        thirdPartyTrackingCode = '-';
      }

      if (!remark.trim()) {
        remark = '-';
      }

      if (isValid) {
        const logisticsOrder = new LogisticsOrder({
          createdByUser: req.user._id,
          status: 'Draft Order',
          description: description,
          customerType: customerType,
          customerName: customerName,
          customerContact: customerContact,
          address: {
            address1: emptyAddress,
            address2: '-',
            city: '-',
            postalCode: '-',
            country: '-'
          },
          productQty: productQty,
          paymentStatus: paymentStatus,
          paymentType: paymentType,
          paymentAmount: paymentAmount,
          deliveryType: deliveryType,
          thirdPartyTrackingCode: thirdPartyTrackingCode,
          remark
        });

        await logisticsOrder.save();
        req.flash('success', 'Logistics Order created successfully!');
        return res.status(201).render('customerService/createLogisticsOrder',
          {
            customerType,
            paymentType,
          });
      }
    } else if (allowEmptyAddress === 'yes' || !address1.trim() || !address2.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      req.flash('warning', 'Please make sure all address related fields are empty if you choose "Without Address"!');
    } else {
      // If the user does not choose "Allow empty address"
      let isValid = true;

      const allowedCustomerTypeValue = [
        'New Customer',
        'Repeat Order',
      ];
      if (!allowedCustomerTypeValue.includes(customerType)) {
        isValid = false;
        req.flash('error', 'Invalid Customer Type.');
      }
      if (customerType === "Repeat Order") {
        const existCustomer = await LogisticsOrder.find({
          createdByUser: req.user._id,
          customerName: customerName,
          customerContact: customerContact
        });

        if (existCustomer.length > 0) {
          isValid = true;
        } else {
          isValid = false;
          req.flash('error', 'No repeat customer found, "Customer Name" and "Customer Contact" must exist.');
        }
      } else {
        if (customerContact.length < 11 || customerContact.length > 12 || !validator.isMobilePhone(customerContact, 'any', { strictMode: false })) {
          isValid = false;
          req.flash('error', 'Invalid phone number.');
        }

        const existCustomerContact = await LogisticsOrder.find({
          customerContact: customerContact,
        });

        if (existCustomerContact.length > 0) {
          isValid = false;
          req.flash('error', 'Customer Contact exist.');
        }
      }

      if (!customerName.trim()) {
        isValid = false;
        req.flash('error', 'Customer Name must be filled in.');
      }

      if (!address1.trim()) {
        isValid = false;
        req.flash('error', 'Address 1 must be filled in.');
      }

      if (!city.trim()) {
        isValid = false;
        req.flash('error', 'City must be filled in.');
      }

      if (!postalCode.trim()) {
        isValid = false;
        req.flash('error', 'Postal Code must be filled in.');
      }

      if (!country.trim()) {
        isValid = false;
        req.flash('error', 'Country must be filled in.');
      }

      if (!productQty.trim()) {
        isValid = false;
        req.flash('error', 'Product Quantity must be filled in.');
      }

      if (!paymentStatus.trim()) {
        isValid = false;
        req.flash('error', 'Payment Status must be filled in.');
      }

      if (!paymentType.trim()) {
        isValid = false;
        req.flash('error', 'Payment Type must be filled in.');
      }

      if (!paymentAmount.trim()) {
        isValid = false;
        req.flash('error', 'Payment Amount must be filled in.');
      }

      if (!deliveryType.trim()) {
        isValid = false;
        req.flash('error', 'Delivery Type must be filled in.');
      }

      if (!thirdPartyTrackingCode.trim()) {
        thirdPartyTrackingCode = '-';
      }

      if (!remark.trim()) {
        remark = '-';
      }

      if (isValid) {
        // Create a new LogisticsOrder document
        const logisticsOrder = new LogisticsOrder({
          createdByUser: req.user._id, // Replace with the actual user ID
          status: 'Draft Order',
          description,
          customerType,
          customerName,
          customerContact,
          address: {
            address1,
            address2,
            city,
            postalCode,
            country
          },
          productQty,
          paymentStatus,
          paymentType,
          paymentAmount,
          deliveryType,
          thirdPartyTrackingCode,
          remark
        });

        await logisticsOrder.save();
        req.flash('success', 'Logistics Order created successfully!');
        return res.status(201).render('customerService/createLogisticsOrder',
          {
            customerType,
            paymentType,
          });
      }
    }
  } catch (error) {
    console.error(error);
    req.flash('error', error.message);
  }

  return res.status(422).render('customerService/createLogisticsOrder', {
    description,
    customerType,
    customerName,
    customerContact,
    allowEmptyAddress,
    address1, address2, city, postalCode, country,
    productQty,
    paymentStatus,
    paymentType,
    paymentAmount,
    deliveryType,
    thirdPartyTrackingCode,
    remark
  });
};

const logisticsOrderPendingListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    const redirectURL = '/customerService/logisticsOrderPendingList';

    // When page reload:
    let searchStatusField = 'Cancel Delivery';
    if (req.query.searchStatusField) {
      searchStatusField = req.query.searchStatusField;
    }

    let query = {
      createdByUser: req.user._id,
      status: searchStatusField,
    };
    const searchQuery = req.query.search;
    const searchField = req.query.searchField;

    if (searchQuery && searchField) {
      switch (searchField) {
        case 'paymentAmount':
          // Check if the entered value is a valid number
          const paymentAmount = parseFloat(searchQuery);

          if (isNaN(paymentAmount)) {
            req.flash('warning', 'Invalid payment amount format. Please enter a valid number.');
            return res.status(422).render('customerService/logisticsOrderPendingList');
          }

          query = { paymentAmount: paymentAmount };
          break;

        case '_id':
        case 'createdByUser':
          // Check if the entered value is a valid ObjectId
          if (mongoose.Types.ObjectId.isValid(searchQuery)) {
            query = { [searchField]: new mongoose.Types.ObjectId(searchQuery) }; // The `searchField` is need to be same as the DB target search field!
          } else {
            req.flash('warning', `Invalid ObjectId format for ${searchField}.`);
            return res.status(200).redirect('/customerService/logisticsOrderPendingList');
          }
          break;

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
          query = { [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
          break;
        case 'createdAt':
        case 'updatedAt':
          const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
          const startDate = new Date(searchQuery);

          if (isNaN(startDate.getTime())) {
            req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
            return res.status(200).redirect('/customerService/logisticsOrderPendingList');
          }

          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);

          query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
          break;
        default:
          req.flash('warning', 'Invalid search field.');
          return res.status(200).redirect('/customerService/logisticsOrderPendingList');
      }
    }

    const logisticsOrders = await LogisticsOrder.find(query).skip(skip).limit(perPage);
    const totalLogisticsOrders = await LogisticsOrder.countDocuments(query);
    const totalPages = Math.ceil(totalLogisticsOrders / perPage);

    const pagination = {
      prev: page > 1 ? `/customerService/logisticsOrderPendingList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      next: page < totalPages ? `/customerService/logisticsOrderPendingList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      current: page,
      totalPages: totalPages,
    };

    if (logisticsOrders.length === 0 && searchQuery) {
      req.flash('warning', `No logistics order found based on the input "${searchQuery}" for the field "${searchField}".`);
    } else if (logisticsOrders.length === 0) {
      req.flash('warning', `No "${searchStatusField}" order status yet...`);
    }

    return res.status(200).render('customerService/logisticsOrderPendingList', {
      logisticsOrders,
      pagination,
      searchQuery,
      searchField,
      searchStatusField,
      page,
      perPage,
      redirectURL,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const logisticsOrderListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    let query = {
      createdByUser: req.user._id,
    };
    const searchQuery = req.query.search;
    const searchField = req.query.searchField;

    if (searchQuery && searchField) {
      switch (searchField) {
        case 'paymentAmount':
          // Check if the entered value is a valid number
          const paymentAmount = parseFloat(searchQuery);

          if (isNaN(paymentAmount)) {
            req.flash('warning', 'Invalid payment amount format. Please enter a valid number.');
            return res.status(200).redirect('/customerService/logisticsOrderList');
          }

          query = { paymentAmount: paymentAmount };
          break;

        case '_id':
        case 'createdByUser':
          // Check if the entered value is a valid ObjectId
          if (mongoose.Types.ObjectId.isValid(searchQuery)) {
            query = { [searchField]: new mongoose.Types.ObjectId(searchQuery) }; // The `searchField` is need to be same as the DB target search field!
          } else {
            req.flash('warning', `Invalid ObjectId format for ${searchField}.`);
            return res.status(200).redirect('/customerService/logisticsOrderList');
          }
          break;

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
          query = { [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
          break;
        case 'createdAt':
        case 'updatedAt':
          const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
          const startDate = new Date(searchQuery);

          if (isNaN(startDate.getTime())) {
            req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
            return res.status(200).redirect('/customerService/logisticsOrderList');
          }

          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);

          query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
          break;

        default:
          req.flash('warning', 'Invalid search field.');
          return res.status(200).redirect('/customerService/logisticsOrderList');
      }
    }

    const logisticsOrders = await LogisticsOrder
      .find(query)
      .sort({ createdAt: -1 })  // Sort by createdAt in descending order (newest first)
      .skip(skip)
      .limit(perPage);
    const totalLogisticsOrders = await LogisticsOrder.countDocuments(query);
    const totalPages = Math.ceil(totalLogisticsOrders / perPage);

    const pagination = {
      prev: page > 1 ? `/customerService/logisticsOrderList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      next: page < totalPages ? `/customerService/logisticsOrderList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      current: page,
      totalPages: totalPages,
    };

    if (logisticsOrders.length === 0 && searchQuery) {
      req.flash('warning', `No logistics order found based on the input "${searchQuery}" for the field "${searchField}".`);
    } else if (logisticsOrders.length === 0) {
      req.flash('warning', `No Logistics Orders yet...`);
    }

    return res.status(200).render('customerService/logisticsOrderList', {
      logisticsOrders,
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
};

const editLogisticsOrderPage = async (req, res) => {
  try {
    // const redirectURL = '/customerService/logisticsOrderList';
    // let addToDeliveryListUser;
    let createdByUserDetails;
    let deliveryUserDetails;
    const logisticsOrderId = req.params.logisticsOrderId;
    const logisticsOrder = await LogisticsOrder
      .findById(logisticsOrderId)
      .where('createdByUser').equals(req.user._id)
      .populate('createdByUser');

    if (!logisticsOrder) {

      req.flash('error', 'Logistics Order not found!');
      return res.status(422).redirect('/customerService/logisticsOrderList');

    }

    let deliveryListEntry = await DeliveryList.findOne({ logisticsOrder_id: logisticsOrderId }).populate('user_id');

    createdByUserDetails = {
      _id: logisticsOrder.createdByUser._id,
      username: logisticsOrder.createdByUser.username,
      // copyCreatedByUserId: logisticsOrder.createdByUser._id,
    };

    if (!deliveryListEntry) {

      deliveryUserDetails = {
        _id: '-',
        username: 'No User Add To "Delivery List" yet.',
        // copyAddToDeliveryListId: '',
      };

    } else {

      deliveryUserDetails = {
        _id: deliveryListEntry.user_id._id,
        username: deliveryListEntry.user_id.username,
        // copyAddToDeliveryListId: deliveryListEntry.user_id._id,
      };
    }

    // console.log(deliveryUserDetails._id);
    // console.log(deliveryUserDetails.username);
    res.status(200).render('customerService/editLogisticsOrder', {
      logisticsOrder,
      createdByUserDetails,
      deliveryUserDetails,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const editLogisticsOrder = async (req, res) => {
  let isValid = true;

  const logisticsOrderId = req.params.logisticsOrderId;

  let { createdByUser, addToDeliveryListId } = req.body;
  const {
    status,
    description,
    customerType,
    customerName,
    customerContact,
    address1, address2, city, postalCode, country,
    productQty,
    paymentStatus,
    paymentType,
    paymentAmount,
    deliveryType,
    thirdPartyTrackingCode,
    remark
  } = req.body;

  try {
    // Check if the LogisticsOrder exists
    const logisticsOrder = await LogisticsOrder
      .find({
        _id: logisticsOrderId,
        createdByUser: req.user._id,
      });

    if (!logisticsOrder) {
      // console.log('LogisticsOrder not found');
      // Handle the case where LogisticsOrder is not found, e.g., return an error response
      req.flash('error', 'Logistics Order is not found, please try agian...');
      return res.status(422).redirect('/customerService/logisticsOrderList');
    }

    if (createdByUser && mongoose.Types.ObjectId.isValid(createdByUser) && createdByUser.trim()) {
      const user = await User.findById(createdByUser);

      if (user) {

        if (logisticsOrder) {
          // If LogisticsOrder exist, update it:
          logisticsOrder.createdByUser = createdByUser;
          await logisticsOrder.save();

          req.flash('success', 'Successful update the "Created By User" field from "Logistics Order"!');

        } else {

          req.flash('error', 'Logistics Order is not found, please try agian...');
        }

      } else {

        req.flash('error', `User ID with "${createdByUser}" from "Created By User:" is not found!`);
      }
    }

    // Check if the addToDeliveryListId is a valid user ID
    if (addToDeliveryListId && mongoose.Types.ObjectId.isValid(addToDeliveryListId) && addToDeliveryListId.trim()) {
      const user = await User.findById(addToDeliveryListId);

      if (user) {
        // Check if a DeliveryList with the given LogisticsOrder ID exists
        const existingDeliveryList = await DeliveryList.findOne({
          logisticsOrder_id: logisticsOrderId,
        });

        if (!existingDeliveryList) {
          // If DeliveryList doesn't exist, create a new one
          const newDeliveryList = new DeliveryList({
            logisticsOrder_id: logisticsOrderId,
            user_id: addToDeliveryListId,
            deliveredAt: '',
          });

          await newDeliveryList.save();

          req.flash('success', 'Successful add to "Delivery List"!');

        } else {
          // If DeliveryList exists, update it:
          existingDeliveryList.user_id = addToDeliveryListId;
          existingDeliveryList.deliveredAt = '';
          await existingDeliveryList.save();

          req.flash('success', 'Successful updated "Delivery List"!');
        }
      } else {

        req.flash('error', `User ID with "${addToDeliveryListId}" from "Added to the delivery list by User:" is not found!`);
        return res.status(201).redirect(`/customerService/logisticsOrderList/edit/${logisticsOrderId}`);
      }

    }

    // Handle other updates for the LogisticsOrder (e.g., updating status, description, etc.)
    const allowedStatusValue = [
      'Draft Order',
      'Order Posted to Feed',
      'Added to Delivery List',
      'Delivery in Progress',
      'Delivered Successfully',
      'Returning',
      'Returned',
      'Delivery Attempted',
      'Cancel Delivery',
    ];
    if (!allowedStatusValue.includes(status)) {
      isValid = false;
      req.flash('error', 'Invalid status.');
    }

    if (isValid) {
      try {
        await LogisticsOrder.findByIdAndUpdate(
          logisticsOrderId,
          {
            status,
            description,
            customerType,
            customerName,
            customerContact,
            address1, address2, city, postalCode, country,
            productQty,
            paymentStatus,
            paymentType,
            paymentAmount,
            deliveryType,
            thirdPartyTrackingCode,
            remark
          }
        );

        req.flash('success', 'Logistics order updated successfully!');
        return res.status(201).redirect('/customerService/logisticsOrderList');

      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      // Render the edit form with the input values if there's an issue
      return res.status(422).render('customerService/editLogisticsOrder', {
        logisticsOrder: {
          _id: logisticsOrder,
          createdByUser,
          addToDeliveryListId,
          status,
          description,
          customerType,
          customerName,
          customerContact,
          address: {
            address1,
            address2,
            city,
            postalCode,
            country
          },
          productQty,
          paymentStatus,
          paymentType,
          paymentAmount,
          deliveryType,
          thirdPartyTrackingCode,
          remark
        }
      })
    };

    // Send a success response
    // res.redirect('/customerService/logisticsOrderList');
  } catch (error) {
    console.error('Error updating LogisticsOrder:', error);
    // Handle the error and send an appropriate response
    res.status(500).json({ error: 'Internal server error' });
  }
};

// const deleteEditLogisticsOrder = async (req, res) => {
//   try {
//     const orderId = req.params.logisticsOrderId;
//     // Remove user from the database
//     await LogisticsOrder.findByIdAndUpdate(orderId, {
//       status: 'hide'
//     });

//     req.flash('success', 'Logistics Order delete successfully!')
//     res.status(201).redirect('/customerService/logisticsOrderList');
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
            return res.status(200).redirect('/customerService/logisticsOrderList');
          }

          query = { ...query, paymentAmount: paymentAmount };
          break;

        case '_id':
          // Check if the entered value is a valid ObjectId
          if (mongoose.Types.ObjectId.isValid(searchQuery)) {
            query = { ...query, [searchField]: new mongoose.Types.ObjectId(searchQuery), status: searchStatusField };
          } else {
            req.flash('warning', `Invalid ObjectId format for ${searchField}.`);
            return res.status(200).redirect('/customerService/logisticsOrderFeed');
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
              return res.status(200).redirect('/customerService/logisticsOrderFeed');
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
            return res.status(200).redirect('/customerService/logisticsOrderFeed');
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
          return res.status(200).redirect('/customerService/logisticsOrderFeed');
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
      prev: page > 1 ? `/customerService/logisticsOrderFeed?page=${page - 1}&search=${searchQuery || ''}&searchStatusField=${searchStatusField || ''}&searchField=${searchField || ''}` : null,
      next: page < totalPages ? `/customerService/logisticsOrderFeed?page=${page + 1}&search=${searchQuery || ''}&searchStatusField=${searchStatusField || ''}&searchField=${searchField || ''}` : null,
      current: page,
      totalPages: totalPages,
    };

    if (logisticsOrders.length === 0 && searchQuery) {
      req.flash('warning', `No logistics order found based on the input "${searchQuery}" for the field "${searchStatusField}" with "${searchField}".`);
    } else if (logisticsOrders.length === 0) {
      req.flash('warning', `No order feeds yet...`);
    }

    res.status(200).render('customerService/logisticsOrderFeed', {
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
      return res.status(200).render('customerService/logisticsOrderDetails', { logisticsOrder })
    }

    req.flash('error', 'Something wrong, please try again...');
    return res.status(422).redirect('/customerService/logisticsOrderFeed');

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

    res.status(201).redirect('/customerService/logisticsOrderFeed');

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
        // createdByUser: req.user._id,
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
      prev: page > 1 ? `/customerService/deliveryList?page=${page - 1}` : null,
      next: page < totalPages ? `/customerService/deliveryList?page=${page + 1}` : null,
      current: page,
      totalPages: totalPages,
    };

    res.status(200).render('customerService/deliveryList', {
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
      return res.status(200).render('customerService/deliveryDetails', { delivery })
    }

    req.flash('error', 'Something wrong, please try again...');
    return res.status(422).redirect('/customerService/deliveryList');

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
    return res.status(201).redirect('/customerService/deliveryList');
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
      return res.status(200).redirect('/customerService/deliveryList');
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
    return res.status(201).redirect('/customerService/startDeliverList');

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
      prev: page > 1 ? `/customerService/startDeliverList?page=${page - 1}` : null,
      next: page < totalPages ? `/customerService/startDeliverList?page=${page + 1}` : null,
      current: page,
      totalPages: totalPages,
    };

    // console.log(thisUserValidDeliveryList);
    return res.status(200).render('customerService/startDeliverList', {
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
      return res.status(200).render('customerService/logisticsOrderDetailsAndActions',
        {
          delivery
        });
    }
    // if (delivery && delivery.logisticsOrder_id.paymentType === 'COD') {
    //   return res.status(200).render('customerService/logisticsOrderDetailsAndActions',
    //     {
    //       delivery,
    //       CODPaymentAmount
    //     });
    // } else {
    //   return res.status(200).render('customerService/logisticsOrderDetailsAndActions',
    //     {
    //       delivery
    //     });
    // }

    req.flash('error', 'Something wrong, please try again...');
    return res.status(500).redirect('/customerService/startDeliverList');

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
        return res.status(500).redirect('/customerService/startDeliverList/logisticsOrderDetailsAndActions/' + deliveryId);
      };

      req.flash('success', 'Updated success!');

    } else {

      req.flash('warning', 'There are some field is invalid!');
      return res.status(422).redirect('/customerService/startDeliverList/logisticsOrderDetailsAndActions/' + deliveryId);

    }

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }

  return res.status(201).redirect('/customerService/startDeliverList');
}

module.exports = {
  createLogisticsOrderPage,
  createLogisticsOrder,
  logisticsOrderPendingListPage,
  logisticsOrderListPage,
  editLogisticsOrderPage,
  editLogisticsOrder,
  // deleteEditLogisticsOrder,
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
