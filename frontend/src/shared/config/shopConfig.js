const SHOP_ITEMS = {
    // Food items
    basicFood: { 
        price: 15, 
        name: 'Small Snack', 
        effect: 25,
        description: 'Increase pet satiety by 25%',
        icon: 'fa-cookie-bite',
        category: 'food'
    },
    normalFood: { 
        price: 30, 
        name: 'Regular Meal', 
        effect: 50,
        description: 'Increase pet satiety by 50%',
        icon: 'fa-drumstick-bite',
        category: 'food'
    },
    premiumFood: { 
        price: 45, 
        name: 'Premium Feast', 
        effect: 75,
        description: 'Increase pet satiety by 75%',
        icon: 'fa-bone',
        category: 'food'
    },
    deluxeFood: { 
        price: 60, 
        name: 'Deluxe Banquet', 
        effect: 100,
        description: 'Increase pet satiety by 100%',
        icon: 'fa-bowl-food',
        category: 'food'
    },
    
    // Toy items
    basicToy: { 
        price: 50, 
        name: 'Simple Ball', 
        effect: 20,
        description: 'Improve pet mood by 20%',
        icon: 'fa-baseball',
        category: 'toys'
    },
    premiumToy: { 
        price: 80, 
        name: 'Interactive Toy', 
        effect: 40,
        description: 'Improve pet mood by 40%',
        icon: 'fa-gamepad',
        category: 'toys'
    },
    deluxeToy: { 
        price: 120, 
        name: 'Smart Toy', 
        effect: 60,
        description: 'Improve pet mood by 60% and reduce hunger by 10%',
        icon: 'fa-robot',
        hungerEffect: -10,
        category: 'toys'
    },
    
    // Adventure passes
    shortPass: { 
        price: 100, 
        name: 'Short Adventure Pass', 
        duration: 1,
        description: 'A 1-hour adventure with small rewards',
        icon: 'fa-ticket',
        minReward: 10,
        maxReward: 30,
        category: 'adventures'
    },
    mediumPass: { 
        price: 200, 
        name: 'Medium Adventure Pass', 
        duration: 3,
        description: 'A 3-hour adventure with moderate rewards',
        icon: 'fa-compass',
        minReward: 30,
        maxReward: 80,
        category: 'adventures'
    },
    longPass: { 
        price: 300, 
        name: 'Long Adventure Pass', 
        duration: 6,
        description: 'A 6-hour adventure with great rewards',
        icon: 'fa-map',
        minReward: 80,
        maxReward: 200,
        category: 'adventures'
    }
};

// Categories configuration
const SHOP_CATEGORIES = [
    { id: 'food', name: 'Food', icon: 'fa-drumstick-bite' },
    { id: 'toys', name: 'Toys', icon: 'fa-baseball' },
    { id: 'adventures', name: 'Adventures', icon: 'fa-compass' }
];

// Helper function to get items by category
const getItemsByCategory = (category) => {
    return Object.entries(SHOP_ITEMS)
        .filter(([_, item]) => item.category === category)
        .map(([id, item]) => ({ id, ...item }));
};

export {
    SHOP_ITEMS,
    SHOP_CATEGORIES,
    getItemsByCategory
}; 