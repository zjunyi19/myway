import React, { useState } from 'react';
import styles from './createpet.module.css';
import { useAuth } from '../../../contexts/AuthContext';

const PET_TYPES = [
    { id: 'cat', name: 'Cat', icon: '🐱' },
    { id: 'dog', name: 'Dog', icon: '🐶' },
    { id: 'rabbit', name: 'Rabbit', icon: '🐰' },
    { id: 'hamster', name: 'Hamster', icon: '🐹' }
];

const CreatePet = ({ onClose, onPetCreated }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError('Please enter a pet name');
            return;
        }

        if (!selectedType) {
            setError('Please select a pet type');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/pet/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    name: name.trim(),
                    type: selectedType
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create pet');
            }

            const pet = await response.json();
            onPetCreated(pet);
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Create Pet</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Pet Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Give your pet a name"
                            maxLength={10}
                        />
                    </div>

                    <div className={styles.typeGroup}>
                        <label>Select Pet Type</label>
                        <div className={styles.typeOptions}>
                            {PET_TYPES.map(type => (
                                <div
                                    key={type.id}
                                    className={`${styles.typeOption} ${selectedType === type.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedType(type.id)}
                                >
                                    <span className={styles.typeIcon}>{type.icon}</span>
                                    <span className={styles.typeName}>{type.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.submitButton}>
                        Create Pet
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePet; 