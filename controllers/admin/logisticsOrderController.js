const LogisticsOrder = require('../../models/logisticsOrderModel');
const User = require('../../models/userModel');
const validator = require('validator');
const paginate = require('express-paginate');
const mongoose = require('mongoose');

const createLogisticsOrderPage = (req, res) =>{
    res.render('admin/createLogisticsOrder');
}

// const createLogisticsOrder = async (req, res) =>{

//   // Extract address details
//   const { 
//     description,
//     allowEmptyAddress,
//     address1, address2, city, postalCode, country,
//     paymentStatus,
//     paymentAmount,
//     deliveryType
//   } = req.body;

//     try {

//         if (allowEmptyAddress === 'yes' && (!address1.trim() && !address2.trim() && !city.trim() && !postalCode.trim() && !country.trim())) {

//           const emptyAddress = 'Order creater leave it empty.';

//           let isValid = true;

//           if (!description.trim()){
//             isValid = false;
//             req.flash('error', 'If you choose "Allow empty address", description must be filled in.');
//           }

//           if (!paymentStatus.trim()) {
//             isValid = false;
//             req.flash('error', 'Payment Status must be filled in.');
//           }
  
//           if (!paymentAmount.trim()) {
//             isValid = false;
//             req.flash('error', 'Payment Amount must be filled in.');
//           }
  
//           if (!deliveryType.trim()) {
//             isValid = false;
//             req.flash('error', 'Delivery Type must be filled in.');
//           }

//           if (isValid) {
//             const logisticsOrder = new LogisticsOrder({
//               createdByUser: req.user._id, // Replace with the actual user ID
//               status: 'Pending',
//               description: description,
//               address: {
//                 address1: emptyAddress,
//                 address2: emptyAddress,
//                 city: emptyAddress,
//                 postalCode: emptyAddress,
//                 country: emptyAddress
//               },
//               paymentStatus: paymentStatus,
//               paymentAmount: paymentAmount,
//               deliveryType: deliveryType
//             });

//             await logisticsOrder.save();
//             req.flash('success', 'Logistics Order create successfully!');
//             return res.render('admin/createLogisticsOrder');
            
//           }
          
//         } else if (allowEmptyAddress === 'yes' || address1.trim() || address2.trim() || city.trim() || postalCode.trim() || country.trim()) {
          
//           req.flash('warning', 'Please make sure the address related field is empty if you choose "Whitout Address"!')
        
//         }else{

//           // If the user is not choose the `Allow blank address`, below this will exercute:
//           let isValid = true;

//           if(!address1.trim()){
//             isValid = false;
//             req.flash('error', 'Address 1 must be filled in.');
//           }
  
//           if (!city.trim()) {
//             isValid = false;
//             req.flash('error', 'City must be filled in.');
//           }
  
//           if (!postalCode.trim()) {
//             isValid = false;
//             req.flash('error', 'Postal Code must be filled in.');
//           }
  
//           if (!country.trim()) {
//             isValid = false;
//             req.flash('error', 'Country must be filled in.');
//           }
  
//           if (!paymentStatus.trim()) {
//             isValid = false;
//             req.flash('error', 'Payment Status must be filled in.');
//           }
  
//           if (!paymentAmount.trim()) {
//             isValid = false;
//             req.flash('error', 'Payment Amount must be filled in.');
//           }
  
//           if (!deliveryType.trim()) {
//             isValid = false;
//             req.flash('error', 'Delivery Type must be filled in.');
//           }
  
//           if (isValid) {
//             // Create a new LogisticsOrder document
//             const logisticsOrder = new LogisticsOrder({
//               createdByUser: req.user._id, // Replace with the actual user ID
//               status: 'Pending',
//               description: description,
//               address: {
//                 address1,
//                 address2,
//                 city,
//                 postalCode,
//                 country
//               },
//               paymentStatus: paymentStatus,
//               paymentAmount: paymentAmount,
//               deliveryType: deliveryType
//             });
  
//             await logisticsOrder.save();
//             req.flash('success', 'Logistics Order create successfully!');
//             return res.render('admin/createLogisticsOrder');            
//           }

//         }

//     } catch (error) {
//         console.error(error);
//         req.flash('error', error.message);
//       }
      
//       return res.render('admin/createLogisticsOrder', {
//         description,
//         allowEmptyAddress,
//         address1, address2, city, postalCode, country,
//         paymentStatus,
//         paymentAmount,
//         deliveryType
//       });
// }

const logisticsOrderListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    let query = {};
    const searchQuery = req.query.search;
    const searchField = req.query.searchField;

    if (searchQuery && searchField) {
      switch (searchField) {
        case 'paymentAmount':
          // Check if the entered value is a valid number
          const paymentAmount = parseFloat(searchQuery);

          if (isNaN(paymentAmount)) {
            req.flash('warning', 'Invalid payment amount format. Please enter a valid number.');
            return res.redirect('/admin/logisticsOrderList');
          }

          query = { paymentAmount: paymentAmount };
          break;
          
        case 'createdByUser':
          // Check if the entered value is a valid ObjectId
          if (mongoose.Types.ObjectId.isValid(searchQuery)) {
            query = { createdByUser: new mongoose.Types.ObjectId(searchQuery) };
          } else {
            req.flash('warning', 'Invalid ObjectId format for createdByUser.');
            return res.redirect('/admin/logisticsOrderList');
          }
          break;

        case 'status':
        case 'description':
        case 'address.address1':
        case 'address.address2':
        case 'address.city':
        case 'address.postalCode':
        case 'address.country':
        case 'paymentStatus':
        case 'deliveryType':
          query = { [searchField]: { $regex: new RegExp(searchQuery, 'i') } };
          break;
        case 'createdAt':
        case 'updatedAt':
          const dateField = (searchField === 'createdAt') ? 'createdAt' : 'updatedAt';
          const startDate = new Date(searchQuery);

          if (isNaN(startDate.getTime())) {
            req.flash('warning', 'Invalid date format, it should be like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".');
            return res.redirect('/admin/logisticsOrderList');
          }

          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);

          query = { ...query, [dateField]: { $gte: startDate, $lte: endDate } };
          break;
        default:
          req.flash('warning', 'Invalid search field.');
          return res.redirect('/admin/logisticsOrderList');
      }
    }

    const logisticsOrders = await LogisticsOrder.find(query).skip(skip).limit(perPage);
    const totalLogisticsOrders = await LogisticsOrder.countDocuments(query);
    const totalPages = Math.ceil(totalLogisticsOrders / perPage);

    const pagination = {
      prev: page > 1 ? `/admin/logisticsOrderList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      next: page < totalPages ? `/admin/logisticsOrderList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      current: page,
      totalPages: totalPages,
    };

    if (logisticsOrders.length === 0 && searchQuery) {
      req.flash('warning', `No logistics order found based on the input "${searchQuery}" for the field "${searchField}".`);
    }

    res.render('admin/logisticsOrderList', { logisticsOrders, pagination, searchQuery, searchField });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const createLogisticsOrder = async (req, res) => {
  // Extract address details
  const {
    description,
    allowEmptyAddress,
    address1, address2, city, postalCode, country,
    paymentStatus,
    paymentAmount,
    deliveryType
  } = req.body;

  try {
    if (allowEmptyAddress === 'yes' && (!address1.trim() && !address2.trim() && !city.trim() && !postalCode.trim() && !country.trim())) {
      const emptyAddress = 'Order creator left it empty.';
      let isValid = true;

      if (!description.trim()) {
        isValid = false;
        req.flash('error', 'If you choose "Allow empty address", description must be filled in.');
      }

      if (!paymentStatus.trim()) {
        isValid = false;
        req.flash('error', 'Payment Status must be filled in.');
      }

      if (!paymentAmount.trim()) {
        isValid = false;
        req.flash('error', 'Payment Amount must be filled in.');
      }

      if (!deliveryType.trim()) {
        isValid = false;
        req.flash('error', 'Delivery Type must be filled in.');
      }

      if (isValid) {
        const logisticsOrder = new LogisticsOrder({
          createdByUser: req.user._id, // Replace with the actual user ID
          status: 'Pending',
          description: description,
          address: {
            address1: emptyAddress,
            address2: emptyAddress,
            city: emptyAddress,
            postalCode: emptyAddress,
            country: emptyAddress
          },
          paymentStatus: paymentStatus,
          paymentAmount: paymentAmount,
          deliveryType: deliveryType
        });

        await logisticsOrder.save();
        req.flash('success', 'Logistics Order created successfully!');
        return res.render('admin/createLogisticsOrder');
      }
    } else if (allowEmptyAddress === 'yes' || !address1.trim() || !address2.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      req.flash('warning', 'Please make sure all address related fields are empty if you choose "Without Address"!');
    } else {
      // If the user does not choose "Allow empty address"
      let isValid = true;

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

      if (!paymentStatus.trim()) {
        isValid = false;
        req.flash('error', 'Payment Status must be filled in.');
      }

      if (!paymentAmount.trim()) {
        isValid = false;
        req.flash('error', 'Payment Amount must be filled in.');
      }

      if (!deliveryType.trim()) {
        isValid = false;
        req.flash('error', 'Delivery Type must be filled in.');
      }

      if (isValid) {
        // Create a new LogisticsOrder document
        const logisticsOrder = new LogisticsOrder({
          createdByUser: req.user._id, // Replace with the actual user ID
          status: 'Pending',
          description: description,
          address: {
            address1,
            address2,
            city,
            postalCode,
            country
          },
          paymentStatus: paymentStatus,
          paymentAmount: paymentAmount,
          deliveryType: deliveryType
        });

        await logisticsOrder.save();
        req.flash('success', 'Logistics Order created successfully!');
        return res.render('admin/createLogisticsOrder');
      }
    }
  } catch (error) {
    console.error(error);
    req.flash('error', error.message);
  }

  return res.render('admin/createLogisticsOrder', {
    description,
    allowEmptyAddress,
    address1, address2, city, postalCode, country,
    paymentStatus,
    paymentAmount,
    deliveryType
  });
};

const editLogisticsOrderPage = async (req, res) =>{
  try {
    const logisticsOrderId = req.params.logisticsOrderId;
    const logisticsOrder = await LogisticsOrder.findById(logisticsOrderId);
    res.render('admin/editLogisticsOrder', { logisticsOrder });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const editLogisticsOrder = async (req, res) => {
  let isValid = true;

  try {
    const orderId = req.params.logisticsOrderId;
    const existingOrder = await LogisticsOrder.findById(orderId);

    const {
      status,
      description,
      address1, address2, city, postalCode, country,
      paymentStatus,
      paymentAmount,
      deliveryType
    } = req.body;

    // Your validation logic goes here
    // ...

    // Assuming you have validation checks similar to the ones in editUser()

    if (isValid) {
      // Update order data in the database based on the submitted form data (req.body)
      try {
        await LogisticsOrder.findByIdAndUpdate(orderId, req.body);

        req.flash('success', 'Logistics order updated successfully!');
        res.redirect('/admin/logisticsOrderList');
      } catch (error) {
        console.error(error);
        req.flash('error', 'Error saving logistics order.');
        res.redirect('/admin/editLogisticsOrder/' + orderId);
      }
    } else {
      // Render the edit form with the input values if there's an issue
      res.render('admin/editLogisticsOrder', {
        order: {
          _id: orderId,
          status,
          description,
          address: {
            address1,
            address2,
            city,
            postalCode,
            country
          },
          paymentStatus,
          paymentAmount,
          deliveryType
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const deleteEditLogisticsOrder = async (req, res) =>{
  try {
    const orderId = req.params.logisticsOrderId;
    // Remove user from the database
    await LogisticsOrder.findByIdAndDelete(orderId);
    res.redirect('/admin/logisticsOrderList');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {
    createLogisticsOrderPage,
    createLogisticsOrder,
    logisticsOrderListPage,
    editLogisticsOrderPage,
    editLogisticsOrder,
    deleteEditLogisticsOrder,
}