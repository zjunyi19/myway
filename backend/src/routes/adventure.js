const express = require('express');
const router = express.Router();
const Adventure = require('../models/AdventureModel');
const Pet = require('../models/PetModel');

// 开始探险
router.post('/start', async (req, res) => {
    try {
        const { petId, adventureType } = req.body;

        // 验证宠物是否存在
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: '宠物不存在' });
        }

        // 检查宠物是否已经在探险中
        const ongoingAdventure = await Adventure.findOne({
            petId,
            status: 'ongoing'
        });

        if (ongoingAdventure) {
            return res.status(400).json({ message: '宠物已经在探险中' });
        }

        // 检查探险券是否足够
        const requiredPasses = {
            short: 1,
            medium: 2,
            long: 3
        };

        if (pet.adventurePass < requiredPasses[adventureType]) {
            return res.status(400).json({ message: '探险券不足' });
        }

        // 计算探险时间和奖励
        const adventureConfig = {
            short: { duration: 1, minReward: 10, maxReward: 30 },
            medium: { duration: 3, minReward: 30, maxReward: 80 },
            long: { duration: 6, minReward: 80, maxReward: 200 }
        };

        const config = adventureConfig[adventureType];
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + config.duration * 60 * 60 * 1000);
        const reward = Math.floor(
            Math.random() * (config.maxReward - config.minReward + 1) + config.minReward
        );

        // 创建探险记录
        const adventure = new Adventure({
            petId,
            type: adventureType,
            startTime,
            endTime,
            reward
        });

        // 扣除探险券
        pet.adventurePass -= requiredPasses[adventureType];
        await pet.save();
        await adventure.save();

        res.status(201).json(adventure);
    } catch (error) {
        console.error('Error starting adventure:', error);
        res.status(500).json({ message: '开始探险失败' });
    }
});

// 获取探险状态
router.get('/status/:petId', async (req, res) => {
    try {
        const { petId } = req.params;

        const adventure = await Adventure.findOne({
            petId,
            status: 'ongoing'
        });

        if (!adventure) {
            return res.status(404).json({ message: '没有正在进行的探险' });
        }

        res.json(adventure);
    } catch (error) {
        console.error('Error getting adventure status:', error);
        res.status(500).json({ message: '获取探险状态失败' });
    }
});

// 完成探险
router.post('/complete/:adventureId', async (req, res) => {
    try {
        const { adventureId } = req.params;

        const adventure = await Adventure.findById(adventureId);
        if (!adventure) {
            return res.status(404).json({ message: '探险不存在' });
        }

        if (adventure.status === 'completed') {
            return res.status(400).json({ message: '探险已经完成' });
        }

        const now = new Date();
        if (now < adventure.endTime) {
            return res.status(400).json({ message: '探险还未结束' });
        }

        // 更新探险状态
        adventure.status = 'completed';
        await adventure.save();

        // 给宠物增加分数
        const pet = await Pet.findById(adventure.petId);
        if (pet) {
            pet.score += adventure.reward;
            await pet.save();
        }

        res.json({ message: '探险完成', reward: adventure.reward });
    } catch (error) {
        console.error('Error completing adventure:', error);
        res.status(500).json({ message: '完成探险失败' });
    }
});

module.exports = router; 