const apiKey = "c193de8f421d6f5d40df163acfc76647";

async function getDataFromAPI(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
    }
    catch(error) {
        console.log(`Error ${error.message}`);
    }

    return null;
}

export async function getWeatherData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    return await getDataFromAPI(url);
}

export async function getForecastData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    return await getDataFromAPI(url);
}

export async function getAirPollutionData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    return await getDataFromAPI(url);
}

export async function getGeoData(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedQuery}&limit=5&appid=${apiKey}`;
    return await getDataFromAPI(url);
}
