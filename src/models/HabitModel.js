const mongoose = require('mongoose');

// Habit Schema
const habitSchema = new mongoose.Schema({
    _id: {},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    habitName: {
        type: String,
        required: true, 
        trim: true,
    },
    frequency: {
        type: String,
        enum: ['day', 'week', 'month'],
        required: true,
    },
    target: {
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        unit: {
            type: String,
            enum: ['times', 'mins', 'hours'],
            required: true,
        },
        type: {
            type: String,
            enum: ['eachtime', 'intotal'],
            default: null,
        },
    },
    dates: {
        start: {
            type: Date,
            required: true,
        },
        end: {
            type: Date,
            default: null,
        },
    },
}, {
    collection: "Habits"
});

module.exports = mongoose.model("Habit", habitSchema);