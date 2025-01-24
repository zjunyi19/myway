export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;
    
    // If less than 24 hours ago
    if (diff < oneDay) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If less than 7 days ago
    if (diff < 7 * oneDay) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric'
    });
}; 