const mongoose = require('mongoose');

// Completion Schema
const completionSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
  habitId: {
    type: mongoose.Schema.Types.ObjectId, // 引用 Habit 表
    ref: 'Habit',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // 如果有用户系统，可以关联 User 表
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  timeSpend: {
    type: Number, // 用户完成任务所花费的时间
    required: false,
  },
});

module.exports = mongoose.model('Completion', completionSchema);