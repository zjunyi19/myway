import Topbar from "../../../topbar/Topbar";
import "./home.css"

export default function Home() {

    const habits = [
        { id: 1, name: 'Read a book' },
        { id: 2, name: 'Exercise' },
        { id: 3, name: 'Meditate' },
    ];

    // Calculate the current month and date
    // Get the current month name
    const today = new Date();
    const curMonth = today.getMonth();
    const m_names = ['January', 'February', 'March', 
        'April', 'May', 'June', 'July', 
        'August', 'September', 'October', 'November', 'December'];

    // Get this week's dates
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
    const monday = new Date(today.setDate(diff));
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekDates = weekDays.map((_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return date.getDate();
    });
    return (
        <div className="homepage">
            <Topbar />
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
                    <div className="dayDate">{weekDates[index]}</div>
                  </div>
                ))}
              </div>
              
              <div className="habitsGrid">
                {habits.map(habit => (
                  <div key={habit.id} className="habitRow">
                    <div className="habitName">{habit.name}</div>
                    {weekDays.map(day => (
                      <div key={`${habit.id}-${day}`} className="checkboxCell">
                        <div className="checkbox"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
      </div>
  )
}
