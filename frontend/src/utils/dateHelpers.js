export const getMonthNames = () => [
  'January', 'February', 'March', 
  'April', 'May', 'June', 'July', 
  'August', 'September', 'October', 'November', 'December'
];

export const getCurrentWeekDates = () => {
  const today = new Date();
  const curMonth = today.getMonth();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
  const monday = new Date(today.setDate(diff));
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'This Week'];
  
  const weekDates = weekDays.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date.getDate();
  });

  return {
    curMonth,
    weekDays,
    weekDates
  };
}; 