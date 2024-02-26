const mongoose = require('mongoose');

// const logisticsOrderSchema = new mongoose.Schema({
//   createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   status: { type: String, required: true },
//   description: { type: String },
//   address: {
//     address1: { type: String, required: true },
//     address2: { type: String },
//     city: { type: String, required: true },
//     postalCode: { type: String, required: true },
//     country: { type: String, required: true }
//   },
//   paymentStatus: { type: String, required: true },
//   paymentAmount: { type: Number, required: true },
//   deliveryType: { type: String, required: true }
// },{
//     timestamps: true
// });

const logisticsOrderSchema = new mongoose.Schema({
  createdByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: { type: String, required: true },
  description: { type: String },
  customerType: { type: String, required: true }, // Added after
  customerName: { type: String, required: true }, // Added after
  customerContact: { type: String, required: true }, // Added after
  address: {
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentStatus: { type: String, required: true },
  paymentType: { type: String, required: true }, // Added after
  paymentAmount: { type: Number, required: true },
  deliveryType: { type: String, required: true },
  remark: { type: String }, // Added after
}, {
  timestamps: true
});


const LogisticsOrder = mongoose.model('LogisticsOrder', logisticsOrderSchema);

module.exports = LogisticsOrder;
