import "./createhabit.css"

export default function CreateHabit({ onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target.className === 'createHabitOverlay') {
      onClose();
    }
  };

  return (
    <div className="createHabitOverlay" onClick={handleOverlayClick}>
      <div className="createHabit">
        <div className="createHabbitTitle">Add a Habit</div>
        <button className="createHabitButton" onClick={onClose}>Back</button>
        <button className="createHabitButton">Submit</button>
        <form className="createHabitForm">
            <div className="createHabitInputGroup">
                <label>I want to</label>
                <input 
                    type="text" 
                    className="createHabitInput" 
                    placeholder="read a book"
                    autoFocus={true}
                />
            </div>

            <div className="createHabitInputGroup">
                <input 
                    type="number" 
                    className="createHabitInput" 
                    placeholder="10"
                />
                <select className="createHabitSelect">
                    <option value="times">times</option>
                    <option value="mins">mins</option>
                    <option value="hours">hours</option>
                </select>
            </div>

            <div className="createHabitInputGroup">
                <label>every</label>
                <select className="createHabitSelect">
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                </select>
            </div>
        </form>
      </div>
    </div>
  )
}
