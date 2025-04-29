const unixTime = Math.floor(Date.now() / 1000);

const date = new Date(unixTime * 1000);

const weekdayNumber = date.getDay();
const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const weekdayName = weekdayNames[weekdayNumber];

console.log(weekdayName);