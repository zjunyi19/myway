const express = require('express');
const router = express.Router();
const Completion = require('../models/CompletionModel');

// 创建新的完成记录
router.post('/create', async (req, res) => {
    try {
        const { habitId, userId, date, duration } = req.body;
        const completion = new Completion({
            habitId,
            userId,
            date,
            timeSpend: duration,
        });

        const savedCompletion = await completion.save();
        res.status(201).json(savedCompletion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 获取特定习惯的所有完成记录
router.get('/byhabit/:habitId', async (req, res) => {
    try {
        const completions = await Completion.find({ habitId: req.params.habitId });
        res.json(completions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 获取特定用户所有的完成记录
router.get('/byuser/:userId', async (req, res) => {
    try {
        const completions = await Completion.find({ userId: req.params.userId });
        res.json(completions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 获取特定日期范围内的完成记录
router.get('/bydate', async (req, res) => {
    try {
        const { startDate, endDate, habitId } = req.query;
        const query = {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        
        if (habitId) {
            query.habitId = habitId;
        }

        const completions = await Completion.find(query);
        res.json(completions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 删除完成记录
router.delete('/delete/:id', async (req, res) => {
    try {
        const completion = await Completion.findByIdAndDelete(req.params.id);
        if (!completion) {
            return res.status(404).json({ message: 'Completion not found' });
        }
        res.json({ message: 'Completion deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;