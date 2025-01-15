import { useState, useEffect } from 'react';
import styles from './completionstatus.module.css';
import { getMonthNames } from '../../../utils/dateHelpers';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarElement
);

export default function CompletionStatus({ habit, day, onClose }) {
  const [currentDay, setCurrentDay] = useState(new Date(day));
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
        setCompletionsToday(data.filter(completion => completion.date.split('T')[0] === currentDay.toISOString().split('T')[0]));
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

  const getChartData = () => {
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
          label: 'Time Spent (Minutes)',
          data,
          fill: false,
          backgroundColor: 'rgba(255,182,193,0.4)',
          borderColor: 'rgba(255,182,193,1)',
        },
      ],
    };
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
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

  return (
    <div className={styles.statusOverlay} onClick={(e) => { if (e.target.className === styles.statusOverlay) onClose();}}>
      <div className={styles.status}>
        <div className={styles.header}>
          <button onClick={handlePreviousDay}>
            <i className="fa-solid fa-left-long"></i>
          </button>
          <h2>{currentDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h2>
          <button onClick={handleNextDay}>
            <i className="fa-solid fa-right-long"></i>
          </button>
        </div>

        <div className={styles.goalSection}>
            <p>My goal is to {habit.habitName} {habit.target.amount} {habit.target.unit} every {habit.frequency}</p>
            {habit.target.timeIfUnitIsTime.timeAmount && <p>and {habit.target.timeIfUnitIsTime.timeAmount} {habit.target.timeIfUnitIsTime.timeUnit}</p>}
        </div>

        <div className={styles.body}>
          <div className={styles.circles}>
            <div className={styles.circle}>
              <span>{completionsToday.length}</span>
              <p>Completions</p>
            </div>
            <div className={styles.circle}>
              <span>{formatDuration(completionsToday.reduce((sum, completion) => sum + completion.timeSpend, 0))}</span>
              <p>Duration</p>
            </div>
          </div>
          <div className={styles.chart}>
            <Bar data={getChartData()} options={chartOptions} />
          </div>

        </div>
      </div>
    </div>
  );
}
