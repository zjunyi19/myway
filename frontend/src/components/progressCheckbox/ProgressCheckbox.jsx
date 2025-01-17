import React from 'react';
import styles from './progressCheckbox.module.css';

const ProgressCheckbox = ({ progress, showCheck, count = null, onClick }) => {
    const radius = 13;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={styles.progressCheckbox} onClick={onClick} style={{ width: 28, height: 28 }}>
            <svg width={28} height={28} viewBox="0 0 28 28">
                <circle
                    className={styles.circle}
                    cx="14"
                    cy="14"
                    r={radius}
                />
                <circle
                    className={styles.progressCircle}
                    cx="14"
                    cy="14"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />

                {showCheck && 
                    <path
                        className={`${styles.checkmark}`}
                        d="M8 14l4 4 8-8"
                    />
                }

                {!showCheck && 
                    <text
                        className={styles.progressText}
                        x="28"
                        y="28"
                        dominantBaseline="middle"
                        textAnchor="middle"
                    >
                        {count === -1 ? Math.round(progress) + '%' : count === 0 ? '' : count}
                    </text>
                } 
            </svg>
        </div>
    );
};

export default ProgressCheckbox; 