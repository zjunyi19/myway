const express = require('express');
const router = express.Router();
const Pet = require('../models/PetModel');
const { SHOP_ITEMS } = require('../config/shopItems');

// 创建新宠物
router.post('/create', async (req, res) => {
    try {
        const { userId, name, type } = req.body;
        // 检查用户是否已经有宠物
        const existingPet = await Pet.findOne({ userId });
        if (existingPet) {
            return res.status(400).json({ message: 'You already have a pet' });
        }

        const pet = new Pet({
            userId,
            name,
            type
        });

        await pet.save();
        res.status(201).json(pet);
    } catch (error) {
        console.error('Error creating pet:', error);
        res.status(500).json({ message: 'Failed to create pet' });
    }
});

// 获取宠物信息
router.get('/:userId', async (req, res) => {
    try {
        const pet = await Pet.findOne({ userId: req.params.userId });
        if (!pet) {
            return res.status(404).json({ message: '宠物不存在' });
        }

        // 更新宠物状态
        pet.updateStatus();
        await pet.save();

        res.json(pet);
    } catch (error) {
        console.error('Error getting pet:', error);
        res.status(500).json({ message: '获取宠物信息失败' });
    }
});

// 使用物品
router.post('/use-item', async (req, res) => {
    try {
        const { petId, itemType } = req.body;
        
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // 更新宠物状态
        pet.updateStatus();

        // 检查物品数量
        if (pet[itemType] <= 0) {
            return res.status(400).json({ message: `${itemType} not enough` });
        }

        // 使用物品效果
        switch (itemType) {
            case 'food':
                if (pet.hunger >= 100) {
                    return res.status(400).json({ message: 'Pet is full' });
                }
                pet.hunger = Math.min(100, pet.hunger + 30);
                pet.lastFeedTime = new Date();
                break;
            case 'toy':
                if (pet.mood >= 100) {
                    return res.status(400).json({ message: 'Pet mood is already good' });
                }
                pet.mood = Math.min(100, pet.mood + 20);
                pet.lastPlayTime = new Date();
                break;
            default:
                return res.status(400).json({ message: 'Invalid item type' });
        }

        // 扣除物品
        pet[itemType] -= 1;
        
        // 增加经验值
        pet.experience += 10;
        
        // 检查是否升级
        const levelUp = pet.checkLevelUp();

        await pet.save();

        res.json({
            pet,
            levelUp,
            message: `成功使用${itemType}`
        });
    } catch (error) {
        console.error('Error using item:', error);
        res.status(500).json({ message: '使用物品失败' });
    }
});

// 购买物品
router.post('/purchase', async (req, res) => {
    try {
        const { petId, itemId, amount = 1 } = req.body;

        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        const item = SHOP_ITEMS[itemId];
        if (!item) {
            return res.status(400).json({ message: 'Invalid item ID' });
        }
        
        const totalPrice = item.price * amount;
        // Check if user has enough points
        if (pet.score < totalPrice) {
            return res.status(400).json({ message: 'Insufficient points' });
        }

        // Deduct points
        pet.score -= totalPrice;
        
        // Apply effects based on item category
        if (item.category === 'food') {
            pet.hunger = Math.min(100, pet.hunger + item.effect);
            pet.lastFeedTime = new Date();
        } else if (item.category === 'toys') {
            pet.mood = Math.min(100, pet.mood + item.effect);
            if (item.hungerEffect) {
                pet.hunger = Math.max(0, pet.hunger + item.hungerEffect);
            }
            pet.lastPlayTime = new Date();
        } else if (item.category === 'adventures') {
            pet.adventurePasses += amount;
        }

        // Add experience for using items
        if (item.category === 'food' || item.category === 'toys') {
            pet.experience += 5 * amount;
            pet.checkLevelUp();
        }

        await pet.save();

        res.json({
            message: `Successfully purchased and used ${amount} ${item.name}`,
            pet
        });
    } catch (error) {
        console.error('Error purchasing item:', error);
        res.status(500).json({ message: 'Failed to purchase item' });
    }
});

// Work for coins
router.post('/work', async (req, res) => {
    try {
        const { petId } = req.body;
        
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Check if pet is already busy
        if (pet.status !== 'idle') {
            return res.status(400).json({ message: 'Pet is already busy' });
        }

        // Update pet status
        pet.status = 'work';
        pet.statusStartTime = new Date();
        pet.updateStatus();

        await pet.save();

        res.json({
            message: 'Pet started working',
            pet
        });
    } catch (error) {
        console.error('Error working:', error);
        res.status(500).json({ message: 'Failed to start work' });
    }
});

// Study for experience
router.post('/study', async (req, res) => {
    try {
        const { petId } = req.body;
        
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Check if pet is already busy
        if (pet.status !== 'idle') {
            return res.status(400).json({ message: 'Pet is already busy' });
        }

        // Update pet status
        pet.status = 'study';
        pet.statusStartTime = new Date();
        pet.updateStatus();

        await pet.save();

        res.json({
            message: 'Pet started studying',
            pet
        });
    } catch (error) {
        console.error('Error studying:', error);
        res.status(500).json({ message: 'Failed to start study' });
    }
});

// Add new route to stop current activity
router.post('/stop-activity', async (req, res) => {
    try {
        const { petId } = req.body;
        
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Calculate rewards based on time spent
        const timeSpent = (new Date() - pet.statusStartTime) / (1000 * 60); // in minutes
        
        if (pet.status === 'work') {
            // 2-3 coins per minute
            const coinsEarned = Math.floor(timeSpent * (2 + Math.random()));
            pet.score += coinsEarned;
            // Small exp gain (0.5-1 per minute)
            const expGained = Math.floor(timeSpent * (0.5 + Math.random() * 0.5));
            pet.experience += expGained;
        } else if (pet.status === 'study') {
            // 2-3 exp per minute
            const expGained = Math.floor(timeSpent * (2 + Math.random()));
            pet.experience += expGained;
            // Small coins (0.5-1 per minute)
            const coinsEarned = Math.floor(timeSpent * (0.5 + Math.random() * 0.5));
            pet.score += coinsEarned;
        }

        // Reset status
        pet.status = 'idle';
        pet.statusStartTime = null;
        pet.updateStatus();
        
        // Check for level up
        const levelUp = pet.checkLevelUp();

        await pet.save();

        res.json({
            message: 'Activity stopped',
            pet,
            levelUp
        });
    } catch (error) {
        console.error('Error stopping activity:', error);
        res.status(500).json({ message: 'Failed to stop activity' });
    }
});

module.exports = router; 