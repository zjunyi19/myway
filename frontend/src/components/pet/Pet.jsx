import React, { useState, useEffect } from 'react';
import styles from './pet.module.css';
import PetShop from './petshop/PetShop';
import PetAdventure from './petadventure/PetAdventure';

const PET_ICONS = {
    cat: '🐱',
    dog: '🐶',
    rabbit: '🐰',
    hamster: '🐹'
};

const Pet = ({ petData, onPetUpdate }) => {
    const [showShop, setShowShop] = useState(false);
    const [showAdventure, setShowAdventure] = useState(false);
    const [activityTimer, setActivityTimer] = useState(null);

    useEffect(() => {
        // Start timer if pet is busy
        if (petData.status !== 'idle' && !activityTimer) {
            const timer = setInterval(() => {
                onPetUpdate();
            }, 60000); // Update every minute
            setActivityTimer(timer);
        }

        // Cleanup timer
        return () => {
            if (activityTimer) {
                clearInterval(activityTimer);
            }
        };
    }, [petData.status, activityTimer]);

    const handleShopClose = () => {
        setShowShop(false);
        onPetUpdate();
    };

    const handleAdventureClose = () => {
        setShowAdventure(false);
        onPetUpdate();
    };

    const handleWork = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/pet/work', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petId: petData._id
                })
            });

            if (response.ok) {
                onPetUpdate();
            }
        } catch (error) {
            console.error('Error working:', error);
        }
    };

    const handleStudy = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/pet/study', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petId: petData._id
                })
            });

            if (response.ok) {
                onPetUpdate();
            }
        } catch (error) {
            console.error('Error studying:', error);
        }
    };

    const handleStopActivity = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/pet/stop-activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petId: petData._id
                })
            });

            if (response.ok) {
                if (activityTimer) {
                    clearInterval(activityTimer);
                    setActivityTimer(null);
                }
                onPetUpdate();
            }
        } catch (error) {
            console.error('Error stopping activity:', error);
        }
    };

    // Calculate experience progress
    const expProgress = petData.getExpProgress ? petData.getExpProgress() : 
        ((petData.experience - ((petData.level - 1) * 100)) / (petData.level * 100)) * 100;

    return (
        <>
            <div className={styles.petCard}>
                <div className={styles.petHeader}>
                    <span className={styles.petName}>{petData.name}</span>
                    <span className={styles.petLevel}>Lv.{petData.level}</span>
                </div>

                <div className={styles.statusBars}>
                    <div className={styles.statusBar}>
                        <div 
                            className={`${styles.statusFill} ${styles.expFill}`}
                            style={{ width: `${Math.round(expProgress)}%` }}
                            title={`Experience: ${Math.round(expProgress)}%`}
                        />
                    </div>
                    <div className={styles.statusBar}>
                        <div 
                            className={`${styles.statusFill} ${styles.healthFill}`}
                            style={{ width: `${Math.round(petData.health)}%` }}
                            title={`Health: ${Math.round(petData.health)}%`}
                        />
                    </div>
                </div>

                <div className={styles.petStats}>
                    <div className={styles.statItem} title="Hunger">
                        <i className="fas fa-drumstick-bite"></i>
                        <span>{Math.round(petData.hunger)}%</span>
                    </div>
                    <div className={styles.statItem} title="Mood">
                        <i className="fas fa-smile"></i>
                        <span>{Math.round(petData.mood)}%</span>
                    </div>
                    <div className={styles.statItem} title="Coins">
                        <i className="fas fa-coins"></i>
                        <span>{petData.score}</span>
                    </div>
                </div>

                <div className={styles.petAvatar}>
                    {PET_ICONS[petData.type]}
                </div>

                <div className={styles.petActions}>
                    <button 
                        className={styles.actionButton}
                        onClick={petData.status === 'work' ? handleStopActivity : handleWork}
                        disabled={petData.status !== 'idle' && petData.status !== 'work'}
                        title={petData.status === 'work' ? "Stop working" : "Work for coins"}
                    >
                        <i className={`fas ${petData.status === 'work' ? 'fa-stop' : 'fa-briefcase'}`}></i>
                    </button>
                    <button 
                        className={styles.actionButton}
                        onClick={petData.status === 'study' ? handleStopActivity : handleStudy}
                        disabled={petData.status !== 'idle' && petData.status !== 'study'}
                        title={petData.status === 'study' ? "Stop studying" : "Study for experience"}
                    >
                        <i className={`fas ${petData.status === 'study' ? 'fa-stop' : 'fa-book'}`}></i>
                    </button>
                    <button 
                        className={styles.actionButton}
                        onClick={() => setShowAdventure(true)}
                        disabled={petData.status !== 'idle'}
                        title="Go on adventure"
                    >
                        <i className="fas fa-hiking"></i>
                    </button>
                    <button 
                        className={styles.actionButton}
                        onClick={() => setShowShop(true)}
                        disabled={petData.status !== 'idle'}
                        title="Visit shop"
                    >
                        <i className="fas fa-store"></i>
                    </button>
                </div>
            </div>

            {showShop && (
                <PetShop
                    petData={petData}
                    onClose={handleShopClose}
                    onPurchase={onPetUpdate}
                />
            )}

            {showAdventure && (
                <PetAdventure
                    petData={petData}
                    onClose={handleAdventureClose}
                    onAdventureComplete={onPetUpdate}
                />
            )}
        </>
    );
};

export default Pet; 