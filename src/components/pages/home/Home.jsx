import { useState, useEffect } from 'react';
import { getMonthNames, getCurrentWeekDates } from '../../../utils/dateHelpers';
import { useAuth } from '../../../contexts/authContext/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Topbar from "../../topbar/Topbar";
import CreateHabit from "../habits/createHabit/CreateHabit";
import UserInfo from "../settings/userinfo/UserInfo";
import EmptyHabitList from "../emptyhabitlist/EmptyHabitList";
import EmptyUser from "../emptyuser/EmptyUser";
import SingleHabit from "../habits/singleHabit/SingleHabit";
import "./home.css";

export default function Home() {
    const { user } = useAuth();
    const [showCreateHabit, setShowCreateHabit] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [habits, setHabits] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHabitId, setSelectedHabitId] = useState(null);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchHabits = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:5001/api/habits/byuser/${user.uid}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch habits');
                }
                
                const data = await response.json();
                setHabits(data);
            } catch (error) {
                console.error('Error fetching habits:', error);
                setError("Failed to load habits");
            } finally {
                setIsLoading(false);
            }
        };
        fetchHabits();
    }, [user, showCreateHabit]);

    const handleCreateHabitClose = () => { setShowCreateHabit(false); };
    const handleCreateHabitOpen = () => { setShowCreateHabit(true); };
    const handleSettingsOpen = () => { setShowSettings(true); };
    const handleSettingsClose = () => { setShowSettings(false); };
    const handleHabitClick = (habitId) => { setSelectedHabitId(habitId); };
    const handleHabitClose = () => { setSelectedHabitId(null); };

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
                                            <div className="habitName">{habit.habitName}</div>
                                            <div className="habitTarget">
                                                {habit.target.name}
                                            </div>
                                        </div>
                                        {weekDays.map(day => (
                                            <div key={`${habit._id}-${day}`} className="checkboxCell">
                                                <div className="checkbox"/>
                                            </div>
                                        ))}
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
        </div>
    );
}
