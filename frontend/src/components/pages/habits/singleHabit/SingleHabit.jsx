import { useState, useEffect } from 'react';
import "./singlehabit.css";

export default function SingleHabit({ habitId, onHabitClose, onHabitUpdate }) {
  const [habit, setHabit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editedHabit, setEditedHabit] = useState(null);

  // 获取习惯数据
  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/habits/byid/${habitId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch habit');
        }
        const data = await response.json();
        
        // 处理日期格式
        const formattedData = {
          ...data,
          dates: {
            start: data.dates.start ? data.dates.start.split('T')[0] : '',
            end: data.dates.end ? data.dates.end.split('T')[0] : ''
          }
        };
        
        setHabit(formattedData);
        setEditedHabit(formattedData);
      } catch (error) {
        setError("Failed to load habit details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabit();
  }, [habitId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editedHabit.habitName.trim() || !editedHabit.target.unit) {
      setError("Please enter all the fields");
      return;
    }

    try {
      const updatedHabit = {
        firebaseUid: habit.firebaseUid,
        habitName: editedHabit.habitName.trim(),
        frequency: editedHabit.frequency,
        target: {
          amount: parseInt(editedHabit.target.amount),
          unit: editedHabit.target.unit,
          timeIfUnitIsTime: editedHabit.target.unit === 'times' ? {
            timeAmount: parseInt(editedHabit.target.timeIfUnitIsTime?.timeAmount) || null,
            timeUnit: editedHabit.target.timeIfUnitIsTime?.timeUnit || 'mins',
            timeType: editedHabit.target.timeIfUnitIsTime?.timeType || 'eachtime'
          } : null
        },
        dates: {
          start: editedHabit.dates.start,
          end: editedHabit.dates.end || null
        }
      };
      
      await onHabitUpdate(habitId, updatedHabit);
      setIsEditing(false);
      setError("");
    } catch (error) {
      setError(error.message || "Failed to update habit");
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return <div className="loadingMessage">Loading habit details...</div>;
  }

  if (error) {
    return <div className="errorMessage">{error}</div>;
  }

  return (

    <div className="singleHabitOverlay" onClick={(e) => { if (e.target.className === 'singleHabitOverlay') onHabitClose();}}>
      <div className="singleHabit">
        <h2>Habit Details</h2>
        <button className="closeButton" onClick={onHabitClose}>×</button>
        
        <form onSubmit={handleSubmit}>
          
          {/* First Line */}
          <div className="habitField">
            <label>I want to</label>
            <input
              type="text"
              value={isEditing ? editedHabit.habitName : habit.habitName}
              onChange={(e) => setEditedHabit({
                ...editedHabit,
                habitName: e.target.value
              })}
              disabled={!isEditing}
            />
          </div>
          
          {/* Second Line */}
          <div className="habitField">
            <div className="targetInputs">
              <input
                type="number"
                value={isEditing ? editedHabit.target.amount : habit.target.amount}
                onChange={(e) => setEditedHabit({
                  ...editedHabit,
                  target: {
                    ...editedHabit.target,
                    amount: e.target.value
                  }
                })}
                disabled={!isEditing}
              />
              <select
                value={isEditing ? editedHabit.target.unit : habit.target.unit}
                onChange={(e) => setEditedHabit({
                  ...editedHabit,
                  target: {
                    ...editedHabit.target,
                    unit: e.target.value,
                    timeIfUnitIsTime: e.target.value === 'times' ? {
                      timeAmount: editedHabit.target.timeIfUnitIsTime?.timeAmount || '',
                      timeUnit: editedHabit.target.timeIfUnitIsTime?.timeUnit || 'mins',
                      timeType: editedHabit.target.timeIfUnitIsTime?.timeType || 'eachtime'
                    } : null
                  }
                })}
                disabled={!isEditing}
              >
                <option value="times">times</option>
                <option value="mins">minutes</option>
                <option value="hours">hours</option>
              </select>

              <span className="separator">every</span>

              <select
                value={isEditing ? editedHabit.frequency : habit.frequency}
                onChange={(e) => setEditedHabit({
                  ...editedHabit,
                  frequency: e.target.value
                })}
                disabled={!isEditing}
              >
                <option value="day">day</option>
                <option value="week">week</option>
              </select>
            </div>
          </div>

          {/* Third Line */}
          {editedHabit.target.unit === 'times' && (
            <div className="habitField">
              <label>for</label>
              <div className="timeInputs">
                <input
                  type="number"
                  value={isEditing ? editedHabit.target.timeIfUnitIsTime?.timeAmount : habit.target.timeIfUnitIsTime?.timeAmount}
                  onChange={(e) => setEditedHabit({
                    ...editedHabit,
                    target: {
                      ...editedHabit.target,
                      timeIfUnitIsTime: {
                        ...editedHabit.target.timeIfUnitIsTime,
                        timeAmount: e.target.value
                      }
                    }
                  })}
                  disabled={!isEditing}
                />
                <select
                  value={isEditing ? editedHabit.target.timeIfUnitIsTime?.timeUnit : habit.target.timeIfUnitIsTime?.timeUnit}
                  onChange={(e) => setEditedHabit({
                    ...editedHabit,
                    target: {
                      ...editedHabit.target,
                      timeIfUnitIsTime: {
                        ...editedHabit.target.timeIfUnitIsTime,
                        timeUnit: e.target.value
                      }
                    }
                  })}
                  disabled={!isEditing}
                >
                  <option value="mins">minutes</option>
                  <option value="hours">hours</option>
                </select>
                <select
                  value={isEditing ? editedHabit.target.timeIfUnitIsTime?.timeType : habit.target.timeIfUnitIsTime?.timeType}
                  onChange={(e) => setEditedHabit({
                    ...editedHabit,
                    target: {
                      ...editedHabit.target,
                      timeIfUnitIsTime: {
                        ...editedHabit.target.timeIfUnitIsTime,
                        timeType: e.target.value
                      }
                    }
                  })}
                  disabled={!isEditing}
                >
                  <option value="eachtime">each time</option>
                  <option value="intotal">in total</option>
                </select>
              </div>
            </div>
          )}

          {/* Start and End Date */}
          <div className="habitField">
            <label>start from</label>
            <input
              type="date"
              value={isEditing ? editedHabit.dates.start : habit.dates.start}
              onChange={(e) => setEditedHabit({
                ...editedHabit,
                dates: {
                  ...editedHabit.dates,
                  start: e.target.value
                }
              })}
              disabled={!isEditing}
            />
          </div>

          <div className="habitField">
            <label>end on {isEditing? "(optional)" : ""}</label>
            <input
              type="date"
              value={isEditing ? editedHabit.dates.end : habit.dates.end}
              onChange={(e) => setEditedHabit({
                ...editedHabit,
                dates: {
                  ...editedHabit.dates,
                  end: e.target.value || null
                }
              })}
              min={editedHabit.dates.start}
              disabled={!isEditing}
            />
          </div>

          <div className="habitButtons">
            {isEditing ? (
              // When editing, show Cancel and Save Change Buttons
              <>
                <button type="button" onClick={() => {setIsEditing(false); setEditedHabit(habit);}}>
                  Cancel
                </button>
                <button type="submit">
                  Save Changes
                </button>
              </>
            ) : (
              // When not editing, show Edit Habit and Delete Habit Buttons
              <>
                <button type="button" onClick={() => setIsEditing(true)}>
                  Edit Habit
                </button>
                <button 
                  type="button"
                  className="deleteButton" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this habit?')) {
                      onHabitUpdate(habitId, null);
                    }
                    onHabitClose();
                  }}
                >
                  Delete Habit
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
