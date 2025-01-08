import "./createhabit.css";
import { useState } from "react";

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function CreateHabit({ onCreateHabitClose }) {
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState("day");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetUnit, setTargetUnit] = useState("times");
  const [targetType, setTargetType] = useState("");
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!habitName.trim()) {
      setError("Please enter a habit name");
      return;
    }

    if (!targetAmount) {
      setError("Please enter a target amount");
      return;
    }

    const habitData = {
      name: habitName.trim(),
      frequency,
      target: {
        amount: parseInt(targetAmount),
        unit: targetUnit,
        type: targetUnit === "times" ? null : targetType
      },
      dates: {
        start: startDate,
        end: endDate || null
      },
      createdAt: new Date().toISOString()
    };

    console.log("New Habit:", habitData);
    onCreateHabitClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'createHabitOverlay') {
      onCreateHabitClose();
    }
  };

  return (
    <div className="createHabitOverlay" onClick={handleOverlayClick}>
      <div className="createHabit">
        <div className="createHabbitTitle">What's your next goal?</div>
        <button className="createHabitButton" onClick={onCreateHabitClose}>Back</button>
        <button 
          className="createHabitButton" 
          type="submit"
          form="habitForm"
        >
          Submit
        </button>
        
        <form 
          id="habitForm"
          className="createHabitForm" 
          onSubmit={handleSubmit}
        >
          <div className="createHabitInputGroup">
            <label>I want to</label>
            <input 
              type="text" 
              className="createHabitInput" 
              placeholder="read a book"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              autoFocus={true}
            />
          </div>

          <div className="createHabitInputGroup">
            <label>every</label>
            <select 
              className="createHabitSelect"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
            </select>

            <label>for</label>
            <input 
              type="number" 
              className="createHabitInput short"
              placeholder="10"
              min="1"
              max="60"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
            <select 
              className="createHabitSelect"
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
            >
              <option value="times">times</option>
              <option value="mins">mins</option>
              <option value="hours">hours</option>
            </select>
            {(targetUnit === "mins" || targetUnit === "hours") && (
              <select 
                className="createHabitSelect wide"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
              >
                <option value="eachtime">each time</option>
                <option value="intotal">in total</option>
              </select>
            )}
          </div>

          <div className="formDivider"></div>

          <div className="createHabitInputGroup">
            <div className="dateGroup">
              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  className="createHabitInput"
                  value={startDate}
                  min={getTodayString()}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  className="createHabitInput"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  )
}
