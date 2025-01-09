const express = require('express');
const router = express.Router();
const Habit = require('../models/HabitModel');

router.post('/createHabit', async (req, res) => {
  try {
    console.log('Received habit submission request:', req.body);
    
    const { _id, userId, habitName, frequency, target, dates } = req.body;

    // Create new user and save to database
    const habit = new Habit({
        _id,
        userId,
        habitName,
        frequency,
        target,
        dates,
    });
    
    await habit.save();
    console.log('Habit saved successfully:', habit);
    
    res.status(201).json({ message: 'Habit submitted successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error submitting habit', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


module.exports = router; 