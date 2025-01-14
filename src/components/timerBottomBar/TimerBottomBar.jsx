import { useState, useEffect } from 'react';
import './timerBottomBar.css';


export default function TimerBottomBar({ habit, onClose, onStart, onStop }) {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timerState, setTimerState] = useState('ready'); // ready, running, paused, stopped

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartPause = () => {
        if (timerState === 'ready' || timerState === 'paused') {
            setIsRunning(true);
            setTimerState('running');
            onStart(); // 通知父组件计时器已启动
        } else if (timerState === 'running') {
            setIsRunning(false);
            setTimerState('paused');
        }
    };

    const handleStop = async () => {
        setIsRunning(false);
        setTimerState('stopped');
        
        try {
            const completion = {
                habitId: habit._id,
                userId: habit.firebaseUid,
                date: new Date().toISOString(),
                duration: time
            };
            console.log('Completion data:', completion);
            const response = await fetch('http://localhost:5001/api/completions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(completion)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save completion');
            }

            console.log('Completion saved successfully:', data);
            // 重置并关闭计时器
            setTime(0);
            onStop(); // 通知父组件计时器已停止
            onClose();
        } catch (error) {
            console.error('Error saving completion:', error);
            // 这里可以添加错误提示
            alert('Failed to save your progress. Please try again.');
        }
    };

    return (
        <div className="timerBottomBar">
            <div className="timerContent">
                <div className="habitName">{habit.habitName}</div>
                <div className="timer">{formatTime(time)}</div>
                <div className="timerControls">
                    <button 
                        className="timerButton"
                        onClick={handleStartPause}
                    >
                        {timerState === 'running' ? 
                            <i className="fa-solid fa-pause"></i> : 
                            <i className="fa-solid fa-play"></i>
                        }
                    </button>
                    {timerState !== 'ready' && (
                        <button 
                            className="timerButton stop"
                            onClick={handleStop}
                        >
                            <i className="fa-solid fa-stop"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 