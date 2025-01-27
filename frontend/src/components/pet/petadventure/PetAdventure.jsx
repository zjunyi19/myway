import React, { useState } from 'react';
import styles from './petadventure.module.css';

const ADVENTURE_TYPES = [
    {
        id: 'short',
        name: 'Short Adventure',
        duration: 1, // hours
        cost: 1,
        description: 'A short adventure with small rewards',
        minReward: 10,
        maxReward: 30
    },
    {
        id: 'medium',
        name: 'Medium Adventure',
        duration: 3,
        cost: 2,
        description: 'A medium adventure with moderate rewards',
        minReward: 30,
        maxReward: 80
    },
    {
        id: 'long',
        name: 'Long Adventure',
        duration: 6,
        cost: 3,
        description: 'A long adventure with great rewards',
        minReward: 80,
        maxReward: 200
    }
];

const PetAdventure = ({ petData, onClose, onAdventureComplete }) => {
    const [selectedAdventure, setSelectedAdventure] = useState(null);
    const [isStarting, setIsStarting] = useState(false);

    const handleStartAdventure = async () => {
        if (!selectedAdventure) return;

        try {
            setIsStarting(true);
            const response = await fetch('http://localhost:5001/api/pet/adventure/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petId: petData._id,
                    adventureType: selectedAdventure.id
                })
            });

            if (response.ok) {
                onAdventureComplete();
                onClose();
            }
        } catch (error) {
            console.error('Error starting adventure:', error);
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className={styles.adventureOverlay} onClick={onClose}>
            <div className={styles.adventureContent} onClick={e => e.stopPropagation()}>
                <div className={styles.adventureHeader}>
                    <h2>Adventure</h2>
                    <div className={styles.adventurePass}>
                        <i className="fas fa-ticket"></i>
                        <span>Adventure Pass: {petData.adventurePass || 0}</span>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className={styles.adventureTypes}>
                    {ADVENTURE_TYPES.map(adventure => (
                        <div 
                            key={adventure.id}
                            className={`${styles.adventureOption} ${selectedAdventure?.id === adventure.id ? styles.selected : ''}`}
                            onClick={() => setSelectedAdventure(adventure)}
                        >
                            <div className={styles.adventureInfo}>
                                <h3>{adventure.name}</h3>
                                <p>{adventure.description}</p>
                                <div className={styles.adventureDetails}>
                                    <span>
                                        <i className="fas fa-clock"></i>
                                        {adventure.duration} hours
                                    </span>
                                    <span>
                                        <i className="fas fa-ticket"></i>
                                        {adventure.cost} passes
                                    </span>
                                    <span>
                                        <i className="fas fa-coins"></i>
                                        {adventure.minReward}-{adventure.maxReward}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.adventureActions}>
                    <button
                        className={styles.startButton}
                        onClick={handleStartAdventure}
                        disabled={!selectedAdventure || isStarting || (petData.adventurePass || 0) < (selectedAdventure?.cost || 0)}
                    >
                        {isStarting ? 'Starting...' : 'Start Adventure'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PetAdventure; 