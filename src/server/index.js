const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const habitRoutes = require('../routes/habits.js');
const completionRoutes = require('../routes/completion.js');
const connectDB = require('./connect.cjs');
const userRoutes = require('../routes/users.js');

const app = express();
const PORT = process.env.PORT || 5001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/completions', completionRoutes);

// 连接数据库
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 