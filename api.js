const apiKey = "c193de8f421d6f5d40df163acfc76647";

export async function fetchData(url, callback) {
    const res = await fetch(`${url}&appid=${apiKey}`);
    const data = await res.json();
    callback(data);
}

export const url = {
    currentWeather(lat, lon) {
        const request = `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`;
        return request;
    },
    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`;
    },
    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}&units=metric`;
    },
    reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`;
    },
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
    }
}

// https://api.openweathermap.org/data/2.5/weather?lat=23.7644025&lon=90.389015&units=metric&appid=c193de8f421d6f5d40df163acfc76647

// https://api.openweathermap.org/data/2.5/weather?lat=23.7644025&lon=90.389015&units=metric&appid=c193de8f421d6f5d40df163acfc76647