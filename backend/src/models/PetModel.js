const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 1
    },
    experience: {
        type: Number,
        default: 0
    },
    health: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    hunger: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    mood: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    score: {
        type: Number,
        default: 100
    },
    adventurePasses: {
        type: Number,
        default: 0
    },
    lastFeedTime: Date,
    lastPlayTime: Date,
    status: {
        type: String,
        enum: ['idle', 'adventure', 'work', 'study'],
        default: 'idle'
    },
    statusStartTime: Date,
    statusEndTime: Date
});

// Calculate experience needed for next level
petSchema.methods.getNextLevelExp = function() {
    return this.level * 100;
};

// Calculate experience progress percentage
petSchema.methods.getExpProgress = function() {
    const nextLevelExp = this.getNextLevelExp();
    const currentLevelExp = (this.level - 1) * 100;
    const currentExp = this.experience - currentLevelExp;
    return (currentExp / (nextLevelExp - currentLevelExp)) * 100;
};

petSchema.methods.checkLevelUp = function() {
    const nextLevelExp = this.getNextLevelExp();
    if (this.experience >= nextLevelExp) {
        this.level += 1;
        // Restore some health on level up
        this.health = Math.min(100, this.health + 20);
        return true;
    }
    return false;
};

petSchema.methods.updateStatus = function() {
    const now = new Date();
    
    // Update hunger
    if (this.lastFeedTime) {
        const hoursSinceLastFeed = (now - this.lastFeedTime) / (1000 * 60 * 60);
        this.hunger = Math.max(0, this.hunger - (hoursSinceLastFeed * 5));
    }
    
    // Update mood
    if (this.lastPlayTime) {
        const hoursSinceLastPlay = (now - this.lastPlayTime) / (1000 * 60 * 60);
        this.mood = Math.max(0, this.mood - (hoursSinceLastPlay * 3));
    }

    // Health decreases if hunger or mood is too low
    if (this.hunger < 30 || this.mood < 30) {
        this.health = Math.max(0, this.health - 1);
    }

    // Check if adventure is complete
    if (this.isOnAdventure && now >= this.adventureEndTime) {
        this.completeAdventure();
    }
};

petSchema.methods.startAdventure = function(duration) {
    if (this.adventurePasses <= 0) {
        throw new Error('No adventure passes available');
    }
    
    if (this.isOnAdventure) {
        throw new Error('Pet is already on an adventure');
    }

    this.isOnAdventure = true;
    this.adventurePasses -= 1;
    this.lastAdventureTime = new Date();
    this.adventureEndTime = new Date(Date.now() + duration * 60 * 60 * 1000);
};

petSchema.methods.completeAdventure = function() {
    if (!this.isOnAdventure) {
        return;
    }

    const adventureDuration = (this.adventureEndTime - this.lastAdventureTime) / (1000 * 60 * 60);
    
    // Random effects
    this.mood += Math.floor(Math.random() * 40) - 20; // -20 to +20
    this.hunger -= Math.floor(Math.random() * 30); // 0 to -30
    this.health -= Math.floor(Math.random() * 20); // 0 to -20
    
    // Ensure values stay within bounds
    this.mood = Math.max(0, Math.min(100, this.mood));
    this.hunger = Math.max(0, Math.min(100, this.hunger));
    this.health = Math.max(0, Math.min(100, this.health));
    
    // Experience gain based on duration
    const expGain = Math.floor((adventureDuration * 20) * (1 + Math.random()));
    this.experience += expGain;
    
    // Random score reward
    const baseReward = adventureDuration * 10;
    this.score += Math.floor(baseReward * (1 + Math.random()));
    
    this.isOnAdventure = false;
    this.adventureEndTime = null;
    
    return {
        expGain,
        healthLoss: this.health - 100,
        moodChange: this.mood - 100,
        hungerLoss: this.hunger - 100
    };
};

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet; 