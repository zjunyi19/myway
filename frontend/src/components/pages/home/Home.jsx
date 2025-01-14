import { useState, useEffect } from 'react';
import { getMonthNames, getCurrentWeekDates } from '../../../utils/dateHelpers';
import { calculateWeekProgress } from '../../../utils/progressCalculator';
import { useAuth } from '../../../contexts/AuthContext';
import Topbar from "../../topbar/Topbar";
import CreateHabit from "../habits/createHabit/CreateHabit";
import UserInfo from "../settings/userinfo/UserInfo";
import EmptyHabitList from "../emptyhabitlist/EmptyHabitList";
import EmptyUser from "../emptyuser/EmptyUser";
import SingleHabit from "../habits/singleHabit/SingleHabit";
import TimerBottomBar from "../../timerBottomBar/TimerBottomBar";
import ProgressCheckbox from "../../progressCheckbox/ProgressCheckbox";
import "./home.css";

export default function Home() {
    const { user } = useAuth();
    const [showCreateHabit, setShowCreateHabit] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [habits, setHabits] = useState([]);
    const [completions, setCompletions] = useState({});
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [timerHabit, setTimerHabit] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchHabitsAndCompletions = async () => {
            try {
                setIsLoading(true);
                const habitsResponse = await fetch(`http://localhost:5001/api/habits/byuser/${user.uid}`);
                
                if (!habitsResponse.ok) {
                    throw new Error('Failed to fetch habits');
                }
                
                const habitsData = await habitsResponse.json();
                setHabits(habitsData);

                // 获取每个习惯的完成记录
                const completionsData = {};
                for (const habit of habitsData) {
                    const completionsResponse = await fetch(`http://localhost:5001/api/completions/byhabit/${habit._id}`);
                    if (completionsResponse.ok) {
                        const habitCompletions = await completionsResponse.json();
                        completionsData[habit._id] = habitCompletions;
                    }
                }
                setCompletions(completionsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHabitsAndCompletions();
    }, [user, showCreateHabit]);

    const handleCreateHabitClose = () => { setShowCreateHabit(false); };
    const handleCreateHabitOpen = () => { setShowCreateHabit(true); };
    const handleSettingsOpen = () => { setShowSettings(true); };
    const handleSettingsClose = () => { setShowSettings(false); };
    const handleHabitClick = (habitId) => { 
        if (!isTimerRunning) {
            setSelectedHabitId(habitId);
        }
    };
    const handleHabitClose = () => { setSelectedHabitId(null); };
    const handleCheckboxClick = (habitId, day) => {
        console.log(`Checkbox clicked for habit ${habitId} on ${day}`);
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
    const handleTimerStop = () => { setIsTimerRunning(false); };

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
        <div className="homepage">
            <Topbar onAddClick={handleCreateHabitOpen} onSettingsClick={handleSettingsOpen} />
            
            <div className="contentContainer">
                {user ? (
                    <>
                        <div className="calendarHeader">
                            <div className="emptyCell"></div>
                            <div className="monthRow" style={{ gridColumn: '2 / -1' }}>
                                {m_names[curMonth]}
                            </div>
                        </div>

                        <div className="daysRow">
                            <div className="emptyCell"></div>
                            {weekDays.map((day, index) => (
                                <div key={day} className="calendarDay">
                                    <div className="dayName">{day}</div>
                                    {day !== 'This Week' && (
                                        <div className="dayDate">{weekDates[index]}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="loadingMessage">Loading habits...</div>
                        ) : error ? (
                            <div className="errorMessage">{error}</div>
                        ) : habits.length === 0 ? (
                            <EmptyHabitList onCreateHabitClick={handleCreateHabitOpen} />
                        ) : (
                            <div className="habitsGrid">
                                {habits.map(habit => (
                                    <div 
                                        key={habit._id} 
                                        className="habitRow" 
                                        onClick={() => handleHabitClick(habit._id)}
                                    >
                                        <div className="habitInfo">
                                            <button 
                                                className="timerStartButton"
                                                onClick={(e) => handleTimerClick(e, habit)}
                                            >
                                                <i className="fa-regular fa-clock"></i>
                                            </button>
                                            <div className="habitName">{habit.habitName}</div>
                                        </div>
                                        
                                        {weekDays.map((day, index) => {
                                            if (day === 'This Week') {
                                                console.log("habit", habit.habitName);
                                        
                                                const weekProgress = calculateWeekProgress(habit, completions[habit._id]);
                                                const weekCount = completions[habit._id]?.length || 0;

                                                return (
                                                    <div key={`${habit._id}-${day}`} className="checkboxCell">
                                                        <ProgressCheckbox
                                                            progress={weekProgress.progress}
                                                            showCheck={weekProgress.showCheck}
                                                            count={weekCount}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCheckboxClick(habit._id, day);
                                                            }}
                                                            size={28}
                                                        />
                                                    </div>
                                                );
                                            }

                                            const date = new Date();
                                            date.setDate(date.getDate() - date.getDay() + index);
                                        
                                            
                                            return (
                                                <div key={`${habit._id}-${day}`} className="checkboxCell">
                                                
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

            {showCreateHabit && <CreateHabit onCreateHabitClose={handleCreateHabitClose} />}
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
                    onClose={handleTimerClose}
                    onStart={handleTimerStart}
                    onStop={handleTimerStop}
                />
            )}
        </div>
    );
}
