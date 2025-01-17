const express = require('express');
const router = express.Router();
const Habits = require('../models/HabitModel')

router.post('/createHabit', async (req, res) => {
  try {
    const { firebaseUid, habitName, frequency, target, dates } = req.body;

    // 创建新的习惯文档
    const habit = new Habits({
      firebaseUid,
      habitName,
      frequency,
      target: {
        amount: target.amount,
        unit: target.unit,
        timeIfUnitIsTime: target.unit === "times" ? {
          timeAmount: target.timeIfUnitIsTime.timeAmount,
          timeUnit: target.timeIfUnitIsTime.timeUnit,
          timeType: target.timeIfUnitIsTime.timeType
        } : {
          timeAmount: 0,
          timeUnit: "mins",
          timeType: "eachtime"
        }
      },
      dates
    });

    await habit.save();
        
    res.status(201).json({ 
      message: 'Habit created successfully',
      habit 
    });
  } catch (error) {
    console.error("Error creating habit:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'Error creating habit', 
      error: error.message,
      details: error.name
    });
  }
});

// 获取用户的习惯
router.get('/byuser/:firebaseUid', async (req, res) => {
  try {
    const habits = await Habits.find({ firebaseUid: req.params.firebaseUid });
    
    if (!habits) {
      return res.status(404).json({ 
        message: 'Habits not found',
        requestedId: req.params.firebaseUid 
      });
    }
    res.json(habits);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching habits',
      error: error.message
    });
  }
});

router.get('/byid/:habitId', async (req, res) => {
  try {

    const habit = await Habits.findOne({ _id: req.params.habitId });
    
    if (!habit) {
      return res.status(404).json({ 
        message: 'Habit not found',
        requestedId: req.params.habitId 
      });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching habit data',
      error: error.message
    });
  }
});

// DELETE endpoint
router.delete('/delete/:habitId', async (req, res) => {
  const { habitId } = req.params;

  try {
    const result = await Habits.findByIdAndDelete(habitId);
    if (!result) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting habit', error });
  }
});

// PUT endpoint
router.put('/update/:habitId', async (req, res) => {
  const { habitId } = req.params;

  try {
    const result = await Habits.findByIdAndUpdate(
      habitId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ 
        message: 'Habit not found',
        habitId: habitId
      });
    }

    res.status(200).json({ 
      message: 'Habit updated successfully', 
      habit: result 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating habit', 
      error: error.message,
      habitId: habitId
    });
  }
});


module.exports = router; 