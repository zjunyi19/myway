import { useState, useEffect } from 'react';
import styles from './completionstatus.module.css';
import { getWeekStart, getWeekEnd } from '../../../utils/progressCalculator';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const weekStart = getWeekStart();
const weekEnd = getWeekEnd();

export default function CompletionStatus({ habit, day, onClose, onDelete }) {
  const [currentDay, setCurrentDay] = useState(new Date(day));
  const [showChart, setShowChart] = useState(false);
  const [completions, setCompletions] = useState([]);
  const [completionsToday, setCompletionsToday] = useState([]);

  useEffect(() => {
    const fetchCompletions = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/completions/byhabit/${habit._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCompletions(data);
        if (day === 'This Week') {
          setCompletionsToday(data.filter(completion => 
            completion.date.split('T')[0] >= weekStart.toISOString().split('T')[0] && 
            completion.date.split('T')[0] <= weekEnd.toISOString().split('T')[0])
          );

        } else {
          setCompletionsToday(data.filter(completion => completion.date.split('T')[0] === currentDay.toISOString().split('T')[0]));
        }
      } catch (error) {
        console.error('Error fetching completions:', error);
      }
    };
    fetchCompletions();
  }, [habit]);

  useEffect(() => {

    const changeDay = () => {
      const filteredCompletions = completions.filter(completion => completion.date.split('T')[0] === currentDay.toISOString().split('T')[0]);
      setCompletionsToday(filteredCompletions);
    }
    changeDay();
  }, [currentDay])

  const handlePreviousDay = () => {
    setCurrentDay(prevDay => {
      const newDate = new Date(prevDay);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDay(prevDay => {
      const newDate = new Date(prevDay);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hrs, mins, secs]
      .map(val => String(val).padStart(2, '0'))
      .join(':');
  };

  const getDailyChartData = () => {
    const hourlyData = {};

    completionsToday.forEach(completion => {
      const date = new Date(completion.date);
      const hour = date.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = 0;
      }
      hourlyData[hour] += completion.timeSpend / 60;
    });

    const labels = Object.keys(hourlyData).map(hour => `${hour}:00`);
    const data = Object.values(hourlyData);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: 'rgba(255,0,0,0.4)',
          borderColor: 'rgba(255,182,193,1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getWeeklyChartData = () => {
    const dailyData = {};

    completionsToday.forEach(completion => {
      const date = new Date(completion.date);
      const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!dailyData[day]) {
        dailyData[day] = 0;
      }
      dailyData[day] += completion.timeSpend / 60;
    }); 

    const labels = Object.keys(dailyData);
    const data = Object.values(dailyData);

    return {
      labels,
      datasets: [{ 
        data, 
        backgroundColor: 'rgba(255,0,0,0.4)', 
        borderColor: 'rgba(255,182,193,1)',
        borderWidth: 1,
      }],
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const handleDelete = async (completionId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/completions/delete/${completionId}`, {
        method: 'DELETE'
      });
      
      // 更新本地状态
      setCompletions(completions.filter(c => c._id !== completionId));
      setCompletionsToday(completionsToday.filter(c => c._id !== completionId));
      onDelete()
    } catch (error) {
      console.error('Error deleting completion:', error);
    }
  };

  return (
    <div className={styles.statusOverlay} onClick={(e) => { if (e.target.className === styles.statusOverlay) onClose();}}>
      <div className={styles.status}>
        
          {day !== 'This Week' ?
            <div className={styles.header1}>
              <button onClick={handlePreviousDay}>
                <i className="fa-solid fa-left-long"></i>
              </button>
              <h2>{currentDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h2>
              <button onClick={handleNextDay}>
                <i className="fa-solid fa-right-long"></i>
              </button>
            </div>
          :
          <div className={styles.header2}>
            <h2> This Week <span>{weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span> </h2>
          </div>
          }

        <div className={styles.goalSection}>
            <p>My goal is to {habit.habitName} {habit.target.amount} {habit.target.unit} every {habit.frequency}</p>
            {habit.target.unit === "times" && habit.target.timeIfUnitIsTime.timeAmount && <p>and {habit.target.timeIfUnitIsTime.timeAmount} {habit.target.timeIfUnitIsTime.timeUnit}</p>}
        </div>

        <div className={styles.body}>
          <div className={styles.circles}>
            <div className={styles.circle} onClick={() => setShowChart(false)}>
              <span>{completionsToday.length}</span>
              <p>Completions</p>
            </div>
            <div className={styles.circle} onClick={() => setShowChart(true)}>
              <span>{formatDuration(completionsToday.reduce((sum, completion) => sum + completion.timeSpend, 0))}</span>
              <p>Duration</p>
            </div>
          </div>
          {!showChart ? 
            <div className={styles.table}>
              <h3>Completion Details</h3>
              <table> 
                <thead>
                  <tr>
                    {day === 'This Week' && <th className={styles.noHover}>Date</th>}
                    <th className={styles.noHover}>Time</th>
                    <th className={styles.noHover}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {completionsToday.map(completion => (
                    <tr key={completion._id}>
                      {day === 'This Week' && <td>{completion.date.split('T')[0]}</td>}
                      <td>{completion.date.split('T')[1].slice(0, 5)}</td>
                      <td>{formatDuration(completion.timeSpend)}</td>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(completion._id)}
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> 
            :
            <div className={styles.chart}>
              {day !== 'This Week' ?
                <Bar data={getDailyChartData()} options={chartOptions} />
              :
                <Bar data={getWeeklyChartData()} options={chartOptions} />
              }
            </div>
          }
        </div>
      </div>
    </div>
  );
}
