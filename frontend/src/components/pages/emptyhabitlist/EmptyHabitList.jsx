import "./emptyhabitlist.css";

export default function EmptyHabitList({ onCreateHabitClick }) {
  return (
    <div className="emptyStateContainer">
      <div className="emptyStateBox">
        <h2>Start Your Journey Today!</h2>
        <p>Ready to build some amazing habits?</p>
        <p>Click the below button to create your first habit and begin your path to success.</p>
        <button className="createFirstHabitButton" onClick={onCreateHabitClick}>
          Create Your First Habit
        </button>
      </div>
    </div>
  );
} 