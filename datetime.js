export function getMonthName(month) {
    const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    return monthNames[month];
}

export function getDayName(day) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"];
    return dayNames[day];
}

export function getDateFromTimestamp(timestamp) {
    return new Date(timestamp * 1000);
}

export function getHourFromTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
  
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12; 
  
    const formattedTime = `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
    return formattedTime;
}

export function getHourFromDateTime(datetime) {
    const date = new Date(datetime);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
    return formattedTime;
}