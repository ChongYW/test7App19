const mongoose = require('mongoose');

// DeliveryList Model
const deliveryListSchema = new mongoose.Schema({
    logisticsOrder_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LogisticsOrder',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deliveredAt: Date
},{
    timestamps: true
});

const DeliveryList = mongoose.model('DeliveryList', deliveryListSchema);

module.exports = DeliveryList;