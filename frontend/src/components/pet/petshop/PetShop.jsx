import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './petshop.module.css';
import { SHOP_ITEMS, SHOP_CATEGORIES, getItemsByCategory } from '../../../config/shopItems';

const PetShop = ({ petData, onClose, onPurchase }) => {
    const [activeTab, setActiveTab] = useState('food');

    const handlePurchase = async (item) => {
        try {
            const response = await fetch('http://localhost:5001/api/pet/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petId: petData._id,
                    itemId: item.id,
                    amount: 1
                })
            });

            if (response.ok) {
                onPurchase();
            }
        } catch (error) {
            console.error('Error purchasing item:', error);
        }
    };

    const renderItems = () => (
        <div className={styles.itemsGrid}>
            {getItemsByCategory(activeTab).map(item => (
                <div key={item.id} className={styles.shopItem}>
                    <div className={styles.itemIcon}>
                        <i className={`fas ${item.icon}`}></i>
                    </div>
                    <div className={styles.itemInfo}>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <div className={styles.itemPrice}>
                            <i className="fas fa-coins"></i>
                            <span>{item.price}</span>
                        </div>
                    </div>
                    <button
                        className={styles.buyButton}
                        onClick={() => handlePurchase(item)}
                        disabled={petData.score < item.price}
                    >
                        Buy
                    </button>
                </div>
            ))}
        </div>
    );

    const content = (
        <div className={styles.shopOverlay} onClick={onClose}>
            <div className={styles.shopContent} onClick={e => e.stopPropagation()}>
                <div className={styles.shopHeader}>
                    <h2>Pet Shop</h2>
                    <div className={styles.petStats}>
                        <div className={styles.statItem}>
                            <i className="fas fa-coins"></i>
                            <span>{petData.score}</span>
                        </div>
                        <div className={styles.statItem}>
                            <i className="fas fa-heart"></i>
                            <span>{Math.round(petData.mood)}%</span>
                        </div>
                        <div className={styles.statItem}>
                            <i className="fas fa-drumstick-bite"></i>
                            <span>{Math.round(petData.hunger)}%</span>
                        </div>
                        <button className={styles.closeButton} onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div className={styles.shopTabs}>
                    {SHOP_CATEGORIES.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <i className={`fas ${tab.icon}`}></i>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.shopContent}>
                    {renderItems()}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(
        content,
        document.body
    );
};

export default PetShop; 