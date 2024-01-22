const LogisticsOrder = require('../../models/logisticsOrderModel');
const User = require('../../models/userModel');
const validator = require('validator');

const createLogisticsOrderPage = (req, res) =>{
    res.render('admin/createLogisticsOrder');
}

const createLogisticsOrder = async (req, res) =>{

    try {
        // Extract address details
        const { address1, address2, city, postalCode, country } = req.body;
    
        // Create a new LogisticsOrder document
        const logisticsOrder = new LogisticsOrder({
          createdByUser: req.user._id, // Replace with the actual user ID
          status: 'Pending',
          description: req.body.description,
          address: {
            address1,
            address2,
            city,
            postalCode,
            country
          },
          paymentStatus: req.body.paymentStatus,
          paymentAmount: req.body.paymentAmount,
          deliveryType: req.body.deliveryType
        });
    
        // Save the LogisticsOrder to the database
        const savedLogisticsOrder = await logisticsOrder.save();
    
        // Redirect to a success page or show the saved order details
        req.flash('success', 'Logistics Order create successfully!');

      } catch (error) {
        console.error(error);
        req.flash('error', error);
      }
      
      return res.render('admin/createLogisticsOrder');
}

module.exports = {
    createLogisticsOrderPage,
    createLogisticsOrder,
}