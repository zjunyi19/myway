const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        ref: 'User'
    },
    receiverId: {
        type: String,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    collection: "Messages"
});

module.exports = mongoose.model('Messages', messageSchema);