const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connection established'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
const habitsRouter = require('./routes/habits');
const completionsRouter = require('./routes/completions');
const usersRouter = require('./routes/users');
const friendsRouter = require('./routes/friends');

app.use('/api/habits', habitsRouter);
app.use('/api/completions', completionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/friends', friendsRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 