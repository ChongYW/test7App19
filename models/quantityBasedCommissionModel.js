const mongoose = require('mongoose');

// QuantityBasedCommission Model
const quantityBasedCommissionSchema = new mongoose.Schema({
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

const QuantityBasedCommission = mongoose.model('QuantityBasedCommission', quantityBasedCommissionSchema);

module.exports = QuantityBasedCommission;