const mongoose = require('mongoose');

const adventureSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    type: {
        type: String,
        enum: ['short', 'medium', 'long'],
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed'],
        default: 'ongoing'
    },
    reward: {
        type: Number,
        required: true
    }
}, {
    collection: "Adventures"
});

module.exports = mongoose.model('Adventures', adventureSchema); 