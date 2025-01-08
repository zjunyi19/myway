import Topbar from "../../topbar/Topbar";
import CreateHabit from "../createHabit/CreateHabit";
import UserInfo from "../settings/userinfo/UserInfo";
import "./home.css"
import { useState } from 'react';
import { getMonthNames, getCurrentWeekDates } from '../../../utils/dateHelpers';

export default function Home() {
    const [showCreateHabit, setShowCreateHabit] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const handleCreateHabitClose = () => {
        setShowCreateHabit(false);
    };

    const handleCreateHabitOpen = () => {
        setShowCreateHabit(true);
    };

    const handleSettingsOpen = () => {
        setShowSettings(true);
    };

    const handleSettingsClose = () => {
        setShowSettings(false);
    };

    const habits = [
        { id: 1, name: 'Read a book' },
        { id: 2, name: 'Exercise' },
        { id: 3, name: 'Meditate' },
    ];

    // Calculate the current month and date
    // Get the current month name
    const m_names = getMonthNames();
    const { curMonth, weekDays, weekDates } = getCurrentWeekDates();

    return (
        <div className="homepage">
            <Topbar onAddClick={handleCreateHabitOpen} onSettingsClick={handleSettingsOpen} />
            <div className="contentContainer">
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
              
              <div className="habitsGrid">
                {habits.map(habit => (
                  <div key={habit.id} className="habitRow">
                    <div className="habitName">{habit.name}</div>
                    {weekDays.map(day => (
                      <div key={`${habit.id}-${day}`} className="checkboxCell">
                        <div className="checkbox"/>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {showCreateHabit && <CreateHabit onCreateHabitClose={handleCreateHabitClose} />}
            {showSettings && <UserInfo onSettingsClose={handleSettingsClose} />}
        </div>
    );
}
