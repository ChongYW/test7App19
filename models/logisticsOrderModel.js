const mongoose = require('mongoose');

const logisticsOrderSchema = new mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true },
  description: { type: String },
  address: {
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentStatus: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  deliveryType: { type: String, required: true }
},{
    timestamps: true
});

const LogisticsOrderModel = mongoose.model('LogisticsOrder', logisticsOrderSchema);

module.exports = LogisticsOrderModel;
