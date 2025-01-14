import React from 'react';
import './progressCheckbox.css';

export default function ProgressCheckbox({ 
    progress, 
    showCheck, 
    onClick,
    size = 24  // 默认大小
}) {
    const radius = (size / 2) - 2;  // 减去边框宽度
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div 
            className="progressCheckbox" 
            onClick={onClick}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size}>
                {/* 背景圆圈 */}
                <circle
                    className={`progressBackground ${showCheck ? 'completed' : ''}`}
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    strokeWidth="2"
                />
                
                {showCheck ? (
                    // 显示绿色对勾
                    <>
                        <circle
                            className="completedCircle"
                            cx={size/2}
                            cy={size/2}
                            r={radius}
                            strokeWidth="2"
                        />
                        <path
                            className="checkmark"
                            d={`M${size/4} ${size/2} L${size/2.5} ${size/1.5} L${size/1.2} ${size/3}`}
                            strokeWidth="2"
                            fill="none"
                        />
                    </>
                ) : (
                    // 显示进度圆环
                    <circle
                        className="progressCircle"
                        cx={size/2}
                        cy={size/2}
                        r={radius}
                        strokeWidth="2"
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: strokeDashoffset
                        }}
                    />
                )}
            </svg>
        </div>
    );
} 