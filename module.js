export const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

/**
 * @param {number} unixTime - Unix timestamp in seconds.
 * @param {number} timezone - Timezone offset from UTC in seconds.
 * @returns {string} - Date string in the format: "Sunday 31, Dec".
 */

export function getDate(unixTime, timezone) {
    const date = new Date((unixTime + timezone) * 1000);
    const weekdayName = weekdayNames[date.getUTCDay()];
    const monthName = monthNames[date.getUTCMonth()];

    return `${weekdayName} ${date.getUTCDate()}, ${monthName}`;
}

/**
 * @param {number} unixTime - Unix timestamp in seconds.
 * @param {number} timezone - Timezone offset from UTC in seconds.
 * @return {string} - Time string in the format: "HH:MM AM/PM"
 */
export function getTime(unixTime, timezone) {
    const date = new Date((unixTime + timezone) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    return `${hours % 12 || 12}: ${minutes} ${period}`;
}

/**
 * @param {number} unixTime - Unix timestamp in seconds.
 * @param {number} timezone - Timezone offset from UTC in seconds.
 * @return {string} - Time string in the format: "HH:MM AM/PM"
 */
// export function getHour(unixTime, timezone) {
//     const date = new Date((unixTime + timezone) * 1000);
//     const hours = date.getUTCHours();
//     const period = hours >= 12 ? "PM" : "AM";

//     return `${hours % 12 || 12}: ${minutes} ${period}`;
// }

export function getHour(unixTime, timezone) {
    const date = new Date((unixTime + timezone) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? "PM" : "AM";

    return `${hours % 12 || 12}:${minutes} ${period}`;
}


/**
 * @param {number} mps - Meter per second
 * @returns {number} - Kilometer per hour
 */
export function mpsToKmh(mps) {
    const mph = mps * 3600;
    return mph / 1000;
}

export const aqiText = {
    1: {
        level: "Good",
        message: "Air quality is considered satisfactory, an air pollution poses little or no risk"
    },
    2: {
        level: "Fair",
        message: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."
    },
    3: {
        level: "Moderate",
        message: "Members of sensitive groups may experience health effects. The general public is not likely to be affected."
    },
    4: {
        level: "Poor",
        message: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."
    },
    5: {
        level: "Very Poor",
        message: "Health warnings of emergency conditions. The entire population is more likely to be affected."
    }
}