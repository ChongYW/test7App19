const mongoose = require('mongoose');

// deliveryCommission Model
const deliveryCommissionSchema = new mongoose.Schema({
    delivery_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryList',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commissionStatus: {
        type: String,
        required: true
    },
    commissionAmount: {
        type: Number
    },
    remark: { type: String },
}, {
    timestamps: true
});

const DeliveryCommission = mongoose.model('deliveryCommission', deliveryCommissionSchema);

module.exports = DeliveryCommission;