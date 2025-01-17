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

// Helper function to convert buffer to base64
export const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};