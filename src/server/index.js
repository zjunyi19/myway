const express = require('express');
const cors = require('cors');
const connectDB = require('./connect.cjs');
const userRoutes = require('../routes/users.js');
const habitRoutes = require('../routes/habits.js');
const app = express();
const PORT = process.env.PORT || 5001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);

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