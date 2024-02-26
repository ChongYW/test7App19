const mongoose = require('mongoose');

const logEntriesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    method: String,
    url: String,
    action: String,           // Action performed (e.g., create, update)
    updatedFields: [String],  // Fields updated during the action
    updatedData: mongoose.Schema.Types.Mixed,  // Data updated during the action
}, {
    timestamps: true
});

const LogEntries = mongoose.model('LogEntries', logEntriesSchema);

module.exports = LogEntries;