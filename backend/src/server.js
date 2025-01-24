const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
require('./config/redis');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// 设置 Socket.IO
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"], // 允许这两个端口的前端访问
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connection established'))
  .catch(err => console.log('MongoDB connection error:', err));

// 初始化Socket处理
socketHandler(io);

// Routes
const habitsRouter = require('./routes/habits');
const completionsRouter = require('./routes/completions');
const usersRouter = require('./routes/users');
const friendsRouter = require('./routes/friends');
const messageRouter = require('./routes/message');

app.use('/api/habits', habitsRouter);
app.use('/api/completions', completionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/messages', messageRouter);

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 