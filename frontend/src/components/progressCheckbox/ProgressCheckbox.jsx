import React from 'react';
import styles from './progressCheckbox.module.css';

export default function ProgressCheckbox({ progress, showCheck, count, onClick, size = 24 }) {
    return (
        <div 
            className={styles.progressCheckbox}
            onClick={onClick}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} viewBox="0 0 24 24">
                {/* Background circle */}
                <circle
                    className={`${styles.progressBackground} ${showCheck ? styles.completed : ''}`}
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="2"
                />
                
                {/* Progress circle */}
                {!showCheck && (
                    <circle
                        className={styles.progressCircle}
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="2"
                        strokeDasharray={`${progress * 62.8 / 100} 62.8`}
                        transform="rotate(-90 12 12)"
                    />
                )}
                
                {/* Checkmark */}
                {showCheck && (
                    <path
                        className={styles.checkmark}
                        d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                    />
                )}
            </svg>
            
            {!showCheck && count > 0 && (
                <div className={styles.count}>{count}</div>
            )}
        </div>
    );
} 