import { useState, useEffect } from 'react';
import { getMonthNames, getCurrentWeekDates } from '../../../utils/dateHelpers';
import { calculateWeekProgress, calculateDayProgress } from '../../../utils/progressCalculator';
import { useAuth } from '../../../contexts/AuthContext';
import { getWeekStart, getWeekEnd } from '../../../utils/progressCalculator';
import Topbar from "../../topbar/Topbar";
import CreateHabit from "../habits/createHabit/CreateHabit";
import FriendsMain from "../friends/FriendsmMain";
import UserInfo from "../settings/userinfo/UserInfo";
import EmptyHabitList from "../emptyhabitlist/EmptyHabitList";
import EmptyUser from "../emptyuser/EmptyUser";
import SingleHabit from "../habits/singleHabit/SingleHabit";
import TimerBottomBar from "../../timerBottomBar/TimerBottomBar";
import ProgressCheckbox from "./progressCheckbox/ProgressCheckbox";
import CompletionStatus from "../completionstatus/CompletionStatus";
import styles from './home.module.css';

export default function Home() {
    const { user } = useAuth();
    const [showCreateHabit, setShowCreateHabit] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
    const [habits, setHabits] = useState([]);
    const [statusHabit, setStatusHabit] = useState(null);
    const [completions, setCompletions] = useState([]);
    const [completionsThisWeek, setCompletionsThisWeek] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [statusDay, setStatusDay] = useState(null);
    const [timerHabit, setTimerHabit] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    const fetchCompletions = async () => {
        try {
            setIsLoading(true);
            // 获取每个习惯的完成记录
            const completionsResponse = await fetch(`http://localhost:5001/api/completions/byuser/${user.uid}`);
            const completionsData = await completionsResponse.json();      
            setCompletions(completionsData);
            const weeklyCompletions = completionsData.filter(c => {
                const date = new Date(c.date);
                return date >= weekStart && date <= weekEnd;
            });
            setCompletionsThisWeek(weeklyCompletions);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHabits = async () => {
        try {
            setIsLoading(true);
            const habitsResponse = await fetch(`http://localhost:5001/api/habits/byuser/${user.uid}`);
            const habitsData = await habitsResponse.json();
            setHabits(habitsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchHabits();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCompletions();
        }
    }, [user]);

    const handleCreateHabitClose = () => { setShowCreateHabit(false); };
    const handleCreateHabitOpen = () => { setShowCreateHabit(true); };
    const handleSettingsOpen = () => { setShowSettings(true); };
    const handleSettingsClose = () => { setShowSettings(false); };
    const handleFriendsOpen = () => { setShowFriends(true); };
    const handleFriendsClose = () => { setShowFriends(false); };
    const handleHabitClick = (habitId, e) => { 
        if (!isTimerRunning && !e.target.closest('.checkboxCell')) {
            setSelectedHabitId(habitId);
        }
    };
    const handleHabitClose = () => { setSelectedHabitId(null); };
    const handleCompletionStatusOpen = (habit, day) => { 
        setStatusDay(day);
        setStatusHabit(habit);
    };
    const handleCompletionStatusClose = () => { 
        setStatusDay(null);
        setStatusHabit(null);
    };

    const handleTimerClick = (e, habit) => {
        e.stopPropagation();  // 阻止事件冒泡
        if (!isTimerRunning) {
            setTimerHabit(habit);
        }
    };

    const handleTimerClose = () => { 
        setTimerHabit(null);
        setIsTimerRunning(false);
    };

    const handleTimerStart = () => { setIsTimerRunning(true); };
    const handleTimerUpdate = () => { fetchCompletions(); };

    const handleHabitUpdate = async (habitId, updatedData) => {
        try {
            if (!updatedData) {
                const response = await fetch(`http://localhost:5001/api/habits/delete/${habitId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete habit');
                }
                
                setHabits(habits.filter(h => h._id !== habitId));
                handleHabitClose();
            } else {
                const { _id, __v, ...dataToUpdate } = updatedData;
                
                const response = await fetch(`http://localhost:5001/api/habits/update/${habitId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dataToUpdate)
                });

                let responseData;
                try {
                    responseData = await response.json();
                } catch (error) {
                    throw new Error('Invalid server response');
                }

                if (!response.ok) {
                    throw new Error(responseData.message || `Failed to update habit: ${response.status}`);
                }

                setHabits(habits.map(h => h._id === habitId ? responseData.habit : h));
                handleHabitClose();
            }
        } catch (error) {
            throw error;
        }
    };

    // Calculate the current month and date
    const m_names = getMonthNames();
    const { curMonth, weekDays, weekDates } = getCurrentWeekDates();

    return (
        <div className={styles.homepage}>
            <Topbar onAddClick={handleCreateHabitOpen} onSettingsClick={handleSettingsOpen} onFriendsClick={handleFriendsOpen} />
            <div className={styles.contentContainer}>
                {user ? (
                    <>
                        <div className={styles.calendarHeader}>
                            <div className={styles.emptyCell}></div>
                            <div className={styles.monthRow} style={{ gridColumn: '2 / -1' }}>
                                {m_names[curMonth]}
                            </div>
                        </div>

                        <div className={styles.daysRow}>
                            <div className={styles.emptyCell}></div>
                            {weekDays.map((day, index) => (
                                <div key={day} className={styles.calendarDay}>
                                    <div className={styles.dayName}>{day}</div>
                                    {day !== 'This Week' && (
                                        <div className={styles.dayDate}>{weekDates[index]}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className={styles.loadingMessage}>Loading habits...</div>
                        ) : error ? (
                            <div className={styles.errorMessage}>{error}</div>
                        ) : habits.length === 0 ? (
                            <EmptyHabitList onCreateHabitClick={handleCreateHabitOpen} />
                        ) : (
                            <div className={styles.habitsGrid}>
                                {habits.map(habit => (
                                    <div 
                                        key={habit._id} 
                                        className={styles.habitRow} 
                                        onClick={(e) => handleHabitClick(habit._id, e)}
                                    >
                                        <div className={styles.habitInfo}>
                                            <button 
                                                className={styles.timerStartButton}
                                                onClick={(e) => handleTimerClick(e, habit)}
                                            >
                                                <i className="fa-regular fa-clock"></i>
                                            </button>
                                            <div className={styles.habitName}>{habit.habitName}</div>
                                        </div>
                                        {weekDays.map((day, index) => {
                                            
                                            if (day === 'This Week') {
                                                const weekProgress = calculateWeekProgress(
                                                    habit, 
                                                    completionsThisWeek.filter(c => c.habitId === habit._id)
                                                );

                                                return (
                                                    <div key={`${habit._id}-${day}`} className={styles.checkboxCell}>
                                                        <ProgressCheckbox
                                                            progress={Math.round(weekProgress)}
                                                            showCheck={weekProgress >= 100}
                                                            count = {-1}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCompletionStatusOpen(habit, 'This Week');
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }

                                            const date = new Date();
                                            date.setDate(date.getDate() - date.getDay() + index + 1);
                                            const dayProgress = calculateDayProgress(
                                                habit, 
                                                completionsThisWeek.filter(c => c.habitId === habit._id && c.date.split('T')[0] === date.toISOString().split('T')[0])
                                            ); 
                                        
                                            return (
                                                <div key={`${habit._id}-${day}`} className={styles.checkboxCell}>
                                                    <ProgressCheckbox
                                                        progress={Math.round(dayProgress.progress)}
                                                        showCheck={dayProgress.progress >= 100}
                                                        count={dayProgress.count}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCompletionStatusOpen(habit, date);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyUser />
                )}
            </div>

            {showFriends && <FriendsMain onFriendsClose={handleFriendsClose} />}
            {showCreateHabit && <CreateHabit onCreateHabitClose={handleCreateHabitClose} onCreateHabitSubmit={fetchHabits}/>}
            {statusHabit && <CompletionStatus 
                habit={statusHabit} 
                day={statusDay} 
                onClose={handleCompletionStatusClose}
                onDelete={fetchCompletions}
            />}
            {showSettings && <UserInfo onSettingsClose={handleSettingsClose} />}
            {selectedHabitId && (
                <SingleHabit
                    habitId={selectedHabitId}
                    onHabitClose={handleHabitClose}
                    onHabitUpdate={handleHabitUpdate}
                />
            )}
            {timerHabit && (
                <TimerBottomBar
                    habit={timerHabit}
                    onTimerClose={handleTimerClose}
                    onTimerStart={handleTimerStart}
                    onTimerUpdate={handleTimerUpdate}
                />
            )}
        </div>
    );
}
