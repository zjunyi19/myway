import React from 'react';
import './progressCheckbox.css';

export default function ProgressCheckbox({ 
    progress, 
    showCheck,
    count = 0, 
    onClick,
    size = 36  // 增大默认大小
}) {
    const radius = (size / 2) - 2;  // 减去边框宽度
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // 计算填充的路径
    const getProgressPath = () => {
        const centerX = size / 2;
        const centerY = size / 2;
        const startAngle = -90; // 从顶部开始
        const progressAngle = (progress / 100) * 360;
        const endAngle = startAngle + progressAngle;
        
        const startRadians = (startAngle * Math.PI) / 180;
        const endRadians = (endAngle * Math.PI) / 180;
        
        const startX = centerX + radius * Math.cos(startRadians);
        const startY = centerY + radius * Math.sin(startRadians);
        const endX = centerX + radius * Math.cos(endRadians);
        const endY = centerY + radius * Math.sin(endRadians);
        
        const largeArcFlag = progressAngle > 180 ? 1 : 0;
        
        return `M ${centerX} ${centerY}
                L ${startX} ${startY}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
                Z`;
    };

    return (
        <div 
            className="progressCheckbox" 
            onClick={onClick}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size}>
                {/* 背景圆圈 */}
                <circle
                    className={`progressBackground ${progress >= 100 ? 'completed' : ''}`}
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    strokeWidth="2"
                />
                
                {progress < 100 && count > 0 ? (
                    // 显示进度填充
                    <path
                        className="progressFill"
                        d={getProgressPath()}
                    />
                ) : null}
                
                {/* 显示计数或对勾 */}
                {count > 0 && (
                    <text
                        x={size/2}
                        y={size/2}
                        className={`progressCount ${progress >= 100 ? 'completed' : ''}`}
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize={size/2}
                    >
                        {progress >= 100 ? '✔' : count}
                    </text>
                )}
            </svg>
        </div>
    );
} 