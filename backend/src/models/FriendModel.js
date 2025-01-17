const mongoose = require('mongoose');

// Friend Schema
const FriendSchema = new mongoose.Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
  habitId: {
    type: String, // 引用 Habit 表
    ref: 'Habit',
    required: true,
  },
  firebaseUid: {
    type: String, // 如果有用户系统，可以关联 User 表
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  timeSpend: {
    type: Number, // 用户完成任务所花费的时间
    default: 0,
  },
}, {
  collection: "Friends"
});

module.exports = mongoose.model('Friends', completionSchema);