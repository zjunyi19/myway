import styles from "./createhabit.module.css";
import { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function CreateHabit({ onCreateHabitClose, onCreateHabitSubmit }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState("day");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetUnit, setTargetUnit] = useState("times");
  const [timeAmount, setTimeAmount] = useState("");
  const [timeUnit, setTimeUnit] = useState("mins");
  const [timeType, setTimeType] = useState("eachtime");
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!habitName.trim() || !targetAmount) {
      setError("Please enter all the fields");
      return;
    }
    setIsLoading(true);
    const habitData = {
      firebaseUid: user.uid,
      habitName: habitName.trim(),
      frequency,
      target: {
        amount: parseInt(targetAmount),
        unit: targetUnit,
        timeIfUnitIsTime: targetUnit === "times" ? {
          timeAmount: parseInt(timeAmount) || null,
          timeUnit,
          timeType
        } : null
      },
      dates: {
        start: startDate,
        end: endDate || null
      }
    };

    try {
      await fetch('http://localhost:5001/api/habits/createHabit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData)
      });
      onCreateHabitClose();
      onCreateHabitSubmit();
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === styles.createHabitOverlay) {
      onCreateHabitClose();
    }
  };

  return (
    <div className={styles.createHabitOverlay} onClick={handleOverlayClick}>
      <div className={styles.createHabit}>
        <div className={styles.createHabbitTitle}>Create a new habit</div>
        <button className={styles.createHabitButton} onClick={onCreateHabitClose}>Back</button>
        <button 
          className={styles.createHabitButton} 
          type="submit"
          form="habitForm"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
        
        <form 
          id="habitForm"
          className={styles.createHabitForm} 
          onSubmit={handleSubmit}
        >
          <div className={styles.createHabitInputGroup}>
            <label>I want to</label>
            <input 
              type="text" 
              className={styles.createHabitInput} 
              placeholder="read a book"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              autoFocus={true}
            />
          </div>

          <div className={styles.createHabitInputGroup}>
            <input
              type="number"
              className={styles.createHabitInputNumber}
              placeholder="enter number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              min="1"
            />

            <select
              className={styles.createHabitSelect}
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
            >
              <option value="times">times</option>
              <option value="mins">mins</option>
              <option value="hours">hours</option>
            </select>

      
            <label>every</label>
            <select 
              className={styles.createHabitSelect}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="day">day</option>
              <option value="week">week</option>
            </select>

            {targetUnit === "times" && (
              <div className={styles.createHabitInputGroup}>
                <label>for</label>
                <input
                  type="number"
                  className={styles.createHabitInputNumber}
                  placeholder="enter number (optional)"
                  value={timeAmount}
                  onChange={(e) => setTimeAmount(e.target.value)}
                  min="1"
                />
                <select
                  className={styles.createHabitSelect}
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                >
                  <option value="mins">minutes</option>
                  <option value="hours">hours</option>
                </select>
                <select
                  className={styles.createHabitSelect}
                  value={timeType}
                  onChange={(e) => setTimeType(e.target.value)}
                >
                  <option value="eachtime">each time</option>
                  <option value="intotal">in total</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.formDivider}></div>

          <div className={styles.createHabitInputGroup}>
            <div className={styles.dateGroup}>
              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  className={styles.createHabitInput}
                  value={startDate}
                  min={getTodayString()}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  className={styles.createHabitInput}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
