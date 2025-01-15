import { useState, useEffect } from 'react';
import styles from './completionstatus.module.css';
import { getMonthNames } from '../../../utils/dateHelpers';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
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
    const labels = completionsToday.map(completion => {
      const date = new Date(completion.date);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const data = completionsToday.map(completion => completion.timeSpend);

    console.log('Chart Labels:', labels);
    console.log('Chart Data:', data);

    return {
      labels,
      datasets: [
        {
          label: 'Time Spent',
          data,
          fill: false,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
        },
      ],
    };
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
        <div className={styles.body}>
          <h3>{habit.habitName}</h3>
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
            <Line data={getChartData()} />
          </div>
        </div>
      </div>
    </div>
  );
}
