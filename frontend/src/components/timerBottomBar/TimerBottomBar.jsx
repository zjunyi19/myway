import { useState, useEffect } from 'react';
import styles from './timerBottomBar.module.css';


export default function TimerBottomBar({ habit, onTimerClose, onTimerStart, onTimerUpdate }) {
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
            onTimerStart();
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
                firebaseUid: habit.firebaseUid,
                date: new Date().toISOString(),
                duration: time
            };
            await fetch('http://localhost:5001/api/completions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(completion)
            });
            // 重置并关闭计时器
            setTime(0);
            onTimerClose();
            onTimerUpdate();
        } catch (error) {
            console.error('Error saving completion:', error);
            alert('Failed to save your progress. Please try again.');
        }
    };

    return (
        <div className={styles.timerBottomBar}>
            <div className={styles.timerContent}>
                <button 
                    className={`${styles.backButton} ${isRunning ? styles.disabled : ''}`}
                    onClick={!isRunning ? onTimerClose : undefined}
                    disabled={isRunning}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <div className={styles.habitName}>{habit.habitName}</div>
                <div className={styles.timer}>{formatTime(time)}</div>
                <div className={styles.timerControls}>
                    <button 
                        className={styles.timerButton}
                        onClick={handleStartPause}
                    >
                        {timerState === 'running' ? 
                            <i className="fa-solid fa-pause"></i> : 
                            <i className="fa-solid fa-play"></i>
                        }
                    </button>
                    {timerState !== 'ready' && (
                        <button 
                            className={`${styles.timerButton} ${styles.stop}`}
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