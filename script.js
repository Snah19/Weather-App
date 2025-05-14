import { getDayName, getMonthName, getHourFromTimestamp, getHourFromDateTime } from "./datetime.js";
import { getWeatherData, getForecastData, getAirPollutionData, getGeoData} from "./resources.js";
import { startOnConnection } from "./connection.js";

startOnConnection();

//#region EVENTS

const btnSearch = document.querySelector(".btn__search");
btnSearch.addEventListener("click", () => {
    const searchView = document.querySelector(".search__view");
    searchView.classList.add("mask-on");

    setTimeout(() => {
        searchField.focus();
    }, 250);
});

const btnBack = document.querySelector(".btn__back");
btnBack.addEventListener("click", () => {
    const searchView = document.querySelector(".search__view");
    searchView.classList.remove("mask-on");
});

const btnCurrentLocation = document.querySelector(".btn__current__location");
btnCurrentLocation.addEventListener("click", () => {
    const {lat, lon} = JSON.parse(localStorage.getItem("userLocation"));
    localStorage.setItem("currentLocation", JSON.stringify({lat, lon}));

    renderMainSection();
});

const searchResultList = document.querySelector(".search__result__list");
searchResultList.addEventListener("click", (event) => {
    event.preventDefault();
    const searchResultLink = event.target.closest(".search__result__link");
    displaySearchResult(searchResultLink);
});
searchResultList.addEventListener("mouseover", (event) => {
    const hoveredSearchResultLink = event.target.closest(".search__result__link");
    if (!hoveredSearchResultLink) {
        return;
    }

    const searchResultLinks = getSearchResultLinks();
    removeClassFromElements(searchResultLinks, "is-hovered");

    if (hoveredSearchResultLink) {
        hoveredSearchResultLink.classList.add("is-hovered");

        focusedIndex = +hoveredSearchResultLink.getAttribute("data-index");
    }
});

const searchField = document.querySelector(".search__field");
searchField.addEventListener("keydown", (event) => {
    const searchResultLinks = getSearchResultLinks();
    if (event.key === "Enter") {
        for (const searchResultLink of searchResultLinks) {
            const index = +searchResultLink.getAttribute("data-index");
        
            if (focusedIndex === -1 || index === focusedIndex) {
                displaySearchResult(searchResultLink);
                focusedIndex = -1;
                return;
            }
        }
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") {
        return;
    }
    
    removeClassFromElements(searchResultLinks, "is-hovered");

    const length = searchResultLinks.length;

    if (event.key === "ArrowDown") {
        event.preventDefault();

        focusedIndex = (focusedIndex + 1) % length;
    }
    else if (event.key === "ArrowUp") {
        event.preventDefault();

        if (focusedIndex === -1) {
            focusedIndex = length - 1;
        }
        else {
            focusedIndex = (focusedIndex + length - 1) % length;
        }
    }

    const hoveredSearchResultLink = getHoveredSearchResultLink(searchResultLinks, focusedIndex);
    const city = hoveredSearchResultLink.querySelector(".city__name").textContent;
    searchField.value = city;
    hoveredSearchResultLink.classList.add("is-hovered");
});
searchField.addEventListener("input", () => {
    if (searchField.value === "") {
        focusedIndex = -1;
        searchResultList.classList.add("is-invisible");
        return;
    }

    renderSearchLResult();
});
searchField.addEventListener("focus", () => {
    if (searchField.value === "") {   
        focusedIndex = -1;     
        return;
    }

    const searchView = document.querySelector(".search__view");
    searchView.classList.add("mask-on");

    renderSearchLResult();
});
searchField.addEventListener("blur", (event) => {
    const screenWidth = window.matchMedia('(min-width: calc(768 / 16 * 1rem))');

    if (!searchResultList.contains(event.relatedTarget)) {
        searchResultList.classList.add("is-invisible");
    }

    if (screenWidth.matches) {
        const searchView = document.querySelector(".search__view");
        searchView.classList.remove("mask-on");
    }
});


//#endregion

renderMainSection();

export function renderMainSection() {
    renderCurrentWeather();
    renderFiveDayForecast();
    renderTodayHighlights();
    renderHourlyForecast();
}

function displaySearchResult(searchResultLink) {
    const city = searchResultLink.querySelector(".city__name").innerHTML;
    searchField.value = city;

    const lat = searchResultLink.getAttribute("data-lat");
    const lon = searchResultLink.getAttribute("data-lon");

    localStorage.setItem("currentLocation", JSON.stringify({lat, lon}));
    const searchView = document.querySelector(".search__view");
    searchView.classList.remove("mask-on");
    searchResultList.classList.add("is-invisible");
    renderMainSection();
}

//#region HEADER
let focusedIndex = -1;

function removeClassFromElements(elements, className) {
    elements.forEach((element) => {
        element.classList.remove(className);
    });
}

function getSearchResultLinks() {
    return Array.from(searchResultList.querySelectorAll(".search__result__link"));
}

function getHoveredSearchResultLink(searchResultLinks, hoveredIndex) {
    return searchResultLinks.find((searchResultLink) => {
        return +searchResultLink.getAttribute("data-index") === hoveredIndex;
    });
}

async function renderSearchLResult() {
    const geoData = await getGeoData(searchField.value);

    const loadingSpinner = document.querySelector(".loading__spinner");

    if (geoData.length === 0) {
        searchResultList.classList.add("is-invisible");
        loadingSpinner.classList.remove("is-invisible");
    }
    else {
        searchResultList.classList.remove("is-invisible");
        loadingSpinner.classList.add("is-invisible");
    }

    let index = -1;
    let searchResultListItemHTML = "";

    for (const geo of geoData) {
        const { name: city, state, country } = geo;
        const {lat, lon} = geo;

        searchResultListItemHTML += `
<li class="search__result__list__item">
    <a class="search__result__link" href="" data-lat="${lat}" data-lon="${lon}" data-index="${++index}">
        <svg class="svg__location" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512">
            <circle fill="var(--white)" cx="256" cy="192" r="32"/>
            <path fill="var(--white)" d="M256,32C167.78,32,96,100.65,96,185c0,40.17,18.31,93.59,54.42,158.78,29,52.34,62.55,99.67,80,123.22a31.75,31.75,0,0,0,51.22,0c17.42-23.55,51-70.88,80-123.22C397.69,278.61,416,225.19,416,185,416,100.65,344.22,32,256,32Zm0,224a64,64,0,1,1,64-64A64.07,64.07,0,0,1,256,256Z"/>
        </svg>

        <div class="city__container">
            <p class="city__name">${city}</p>
            <p class="state__name">${state || ""} ${state? "," : ""} ${country}</p>
        </div>
    </a>
</li>
        `;
    }

    searchResultList.innerHTML = searchResultListItemHTML;
}

//#endregion

//#region MAIN
//#region CURRENT WEATHER
export async function renderCurrentWeather() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const object =  await getWeatherData(lat, lon);

    const {name: city, sys, main, weather} =object;

    const {country} = sys;
    const {temp} = main;
    const [{description, icon}] = weather;

    const now = new Date();
    const weekdayName = getDayName(now.getDay());
    const monthName = getMonthName(now.getMonth());
    const date = now.getDate();
    const year = now.getFullYear();

    const currentWeatherCard = document.querySelector(".current__weather__card");
    currentWeatherCard.innerHTML = `
<h2 class="current__weather__heading">Now</h2>

<!-- display: flex; -->
<div class="current__weather">
    <h2 class="current__temperature__heading">${Math.round(temp)}&deg;<sub>c</sub></h2>
    <img class="current__weather__image" src="./images/weather_icons/${icon}.png" alt="" width="60" height="60" />
</div>
<p class="weather__description">${description}</p>
<hr class="horizontal-rule" />

<!-- display: flex; -->
<div class="current__weather__date">
    <svg class="svg__calendar" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512">
        <path fill="var(--white)" d="M480,128a64,64,0,0,0-64-64H400V48.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,368,48V64H144V48.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,112,48V64H96a64,64,0,0,0-64,64v12a4,4,0,0,0,4,4H476a4,4,0,0,0,4-4Z"/>
        <path fill="var(--white)" d="M32,416a64,64,0,0,0,64,64H416a64,64,0,0,0,64-64V179a3,3,0,0,0-3-3H35a3,3,0,0,0-3,3ZM376,208a24,24,0,1,1-24,24A24,24,0,0,1,376,208Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,376,288Zm-80-80a24,24,0,1,1-24,24A24,24,0,0,1,296,208Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,296,288Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,296,368Zm-80-80a24,24,0,1,1-24,24A24,24,0,0,1,216,288Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,216,368Zm-80-80a24,24,0,1,1-24,24A24,24,0,0,1,136,288Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,136,368Z"/>
    </svg>
    <p class="current__date">${weekdayName} ${date} ${monthName} , ${year}</p>
</div>
<div class="current__weather__location">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512">
        <circle fill="var(--white)" cx="256" cy="192" r="32"/>
        <path fill="var(--white)" d="M256,32C167.78,32,96,100.65,96,185c0,40.17,18.31,93.59,54.42,158.78,29,52.34,62.55,99.67,80,123.22a31.75,31.75,0,0,0,51.22,0c17.42-23.55,51-70.88,80-123.22C397.69,278.61,416,225.19,416,185,416,100.65,344.22,32,256,32Zm0,224a64,64,0,1,1,64-64A64.07,64.07,0,0,1,256,256Z"/>
    </svg>
    <p class="current__location">${city}, ${country}</p>
</div>
    `;
}
//#endregion
//#region FIVE DAY FORECAST
export async function renderFiveDayForecast() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const object = await getForecastData(lat, lon);

    const {list} = object;
    const fiveDayForecastList = document.querySelector(".five__day__forecast__list");
    let fiveDayForecastListItemHTML = ""; 

    for (let i = 7; i < list.length; i += 8) {
        const { dt_txt, weather, main } = list[i];
        const {icon} = weather[0];
        const { temp } = main;

        const date = new Date(dt_txt);
        const monthName = getMonthName(date.getMonth());
        const dayOfMonth = date.getDate();
        const weekdayName = getDayName(date.getDay());

        fiveDayForecastListItemHTML += `
<!-- display: flex; -->
<li class="five__day__forecast__list__item">

    <!-- display: flex; -->
    <div class="weather__and__temperature">
        <img class="weather__icon" src="./images/weather_icons/${icon}.png" width="36" height="36" alt="">
        <p class="temperature">${Math.round(temp)}&deg;c</p>
    </div>
    <p class="date__and__month">${dayOfMonth} ${monthName}</p>
    <p class="week__day">${weekdayName}</p>
</li>
        `;
    }  

    fiveDayForecastList.innerHTML = fiveDayForecastListItemHTML;
}
//#endregion
//#region TODAY HIGHLIGHTS
export async function renderTodayHighlights() {
    generateAirQualityIndex();
    renderSunriseAndSunset();
    renderHumidity();
    renderPressure();
    renderVisibility();
    renderFeelsLike();
}

async function generateAirQualityIndex() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const data = await getAirPollutionData(lat, lon);

    const {list} = data;
    const {components, main} = list[0];
    
    const {no2, o3, so2, pm2_5} = components;
    const {aqi} = main;

    const aqiText = {
        1: {
            level: "Good"
        },
        2: {
            level: "Fair"
        },
        3: {
            level: "Moderate"
        },
        4: {
            level: "Poor"
        },
        5: {
            level: "Very Poor"
        },
    };

    const airQualityCard = document.querySelector(".today__highlight__list__item.air-quality");

    airQualityCard.innerHTML = `
<!-- position: absolute -->
<span class="air__quality__badge aqi-${aqi}">${aqiText[aqi].level}</span>

<h3>Air Quality Index</h3>
<!-- display: flex; -->
<div class="air__quality__table">
    <svg class="svg__wind" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.7639 7C16.3132 6.38625 17.1115 6 18 6C19.6569 6 21 7.34315 21 9C21 10.6569 19.6569 12 18 12H3M8.50926 4.66667C8.87548 4.2575 9.40767 4 10 4C11.1046 4 12 4.89543 12 6C12 7.10457 11.1046 8 10 8H3M11.5093 19.3333C11.8755 19.7425 12.4077 20 13 20C14.1046 20 15 19.1046 15 18C15 16.8954 14.1046 16 13 16H3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <ul class="air__quality__list">
        <li class="air__quality__list__item">
            <p>${pm2_5}&nbsp;</p>
            <span>PM<sub>2.5</sub></span>
        </li>
        <li class="air__quality__list__item">
            <p>${so2}&nbsp;</p>
            <span>SO<sub>2</sub></span>
        </li>
        <li class="air__quality__list__item">
            <p>${no2}&nbsp;</p>
            <span>NO<sub>2</sub></span>
        </li>
        <li class="air__quality__list__item">
            <p>${o3}&nbsp;</p>
            <span>O<sub>3</sub></span>
        </li>
    </ul>
</div>
    `;
}

async function renderSunriseAndSunset() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const object = await getForecastData(lat, lon);

    const {city} = object;
    const {sunrise, sunset} = city;

    const sunRiseAndSunsetCard = document.querySelector(".today__highlight__list__item.sunrise-and-sunset");
    sunRiseAndSunsetCard.innerHTML = `
<h3>Sunrise & Sunset</h3>
<!-- display: flex; -->
<ul class="sunrise__and__sunset__list">
    <li class="sunrise__list__item">
        <svg class="svg__sun" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" fill="#fff">
            <path d="M256,118a22,22,0,0,1-22-22V48a22,22,0,0,1,44,0V96A22,22,0,0,1,256,118Z"/>
            <path d="M256,486a22,22,0,0,1-22-22V416a22,22,0,0,1,44,0v48A22,22,0,0,1,256,486Z"/>
            <path d="M369.14,164.86a22,22,0,0,1-15.56-37.55l33.94-33.94a22,22,0,0,1,31.11,31.11l-33.94,33.94A21.93,21.93,0,0,1,369.14,164.86Z"/>
            <path d="M108.92,425.08a22,22,0,0,1-15.55-37.56l33.94-33.94a22,22,0,1,1,31.11,31.11l-33.94,33.94A21.94,21.94,0,0,1,108.92,425.08Z"/>
            <path d="M464,278H416a22,22,0,0,1,0-44h48a22,22,0,0,1,0,44Z"/>
            <path d="M96,278H48a22,22,0,0,1,0-44H96a22,22,0,0,1,0,44Z"/>
            <path d="M403.08,425.08a21.94,21.94,0,0,1-15.56-6.45l-33.94-33.94a22,22,0,0,1,31.11-31.11l33.94,33.94a22,22,0,0,1-15.55,37.56Z"/>
            <path d="M142.86,164.86a21.89,21.89,0,0,1-15.55-6.44L93.37,124.48a22,22,0,0,1,31.11-31.11l33.94,33.94a22,22,0,0,1-15.56,37.55Z"/>
            <path d="M256,358A102,102,0,1,1,358,256,102.12,102.12,0,0,1,256,358Z"/>
        </svg>
        <div>
            <p class="sun__event">Sunrise</p>
            <p class="sun__time">${getHourFromTimestamp(sunrise)}</p>
        </div>
    </li>
    <li class="sunset__list__item">
        <svg class="svg__moon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" fill="#fff">
            <path d="M264,480A232,232,0,0,1,32,248C32,154,86,69.72,169.61,33.33a16,16,0,0,1,21.06,21.06C181.07,76.43,176,104.66,176,136c0,110.28,89.72,200,200,200,31.34,0,59.57-5.07,81.61-14.67a16,16,0,0,1,21.06,21.06C442.28,426,358,480,264,480Z"/>
        </svg>
        <div>
            <p class="sun__event">Sunset</p>
            <p class="sun__time">${getHourFromTimestamp(sunset)}</p>
        </div>
    </li>
</ul>
    `;

}

async function renderHumidity() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const object = await getForecastData(lat, lon);

    const {list} = object;
    const {main} = list[0];
    const {humidity} = main;

    const humidityCard = document.querySelector(".today__highlight__list__item.humidity");
    humidityCard.innerHTML = `
<h3>Humidity</h3>
<!-- display: flex; -->
<div class="div__humidity">
    <svg class="svg__humidity" fill="#fff" height="32" width="32" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    viewBox="0 0 328.611 328.611" xml:space="preserve">
    <g>
        <path d="M209.306,50.798c-2.452-3.337-7.147-4.055-10.485-1.602c-3.338,2.453-4.055,7.147-1.603,10.485
            c54.576,74.266,66.032,123.541,66.032,151.8c0,27.691-8.272,52.794-23.293,70.685c-17.519,20.866-42.972,31.446-75.651,31.446
            c-73.031,0-98.944-55.018-98.944-102.131c0-52.227,28.103-103.234,51.679-136.829c25.858-36.847,52.11-61.415,52.37-61.657
            c3.035-2.819,3.209-7.565,0.39-10.6c-2.819-3.034-7.565-3.209-10.599-0.39c-1.11,1.031-27.497,25.698-54.254,63.765
            c-24.901,35.428-54.586,89.465-54.586,145.71c0,31.062,9.673,59.599,27.236,80.353c20.361,24.061,50.345,36.779,86.708,36.779
            c36.794,0,66.926-12.726,87.139-36.801c17.286-20.588,26.806-49.117,26.806-80.33C278.25,156.216,240.758,93.597,209.306,50.798z"
            />
        <path d="M198.43,148.146l-95.162,95.162c-2.929,2.929-2.929,7.678,0,10.606c1.465,1.464,3.385,2.197,5.304,2.197
            s3.839-0.732,5.304-2.197l95.162-95.162c2.929-2.929,2.929-7.678,0-10.606C206.107,145.217,201.359,145.217,198.43,148.146z"/>
        <path d="M191.965,207.899c-13.292,0-24.106,10.814-24.106,24.106s10.814,24.106,24.106,24.106s24.106-10.814,24.106-24.106
            S205.257,207.899,191.965,207.899z M191.965,241.111c-5.021,0-9.106-4.085-9.106-9.106s4.085-9.106,9.106-9.106
            s9.106,4.085,9.106,9.106S196.986,241.111,191.965,241.111z"/>
        <path d="M125.178,194.162c13.292,0,24.106-10.814,24.106-24.106s-10.814-24.106-24.106-24.106s-24.106,10.814-24.106,24.106
            S111.886,194.162,125.178,194.162z M125.178,160.949c5.021,0,9.106,4.085,9.106,9.106s-4.085,9.106-9.106,9.106
            c-5.021,0-9.106-4.085-9.106-9.106S120.156,160.949,125.178,160.949z"/>
    </g>
    </svg>
    <p>${humidity}%</p>
</div>
    `;
}

async function renderPressure() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const object = await getForecastData(lat, lon);

    const {list} = object;
    const {main} = list[0];
    const {pressure} = main;
    
    const pressureCard = document.querySelector(".today__highlight__list__item.pressure");
    pressureCard.innerHTML = `
<h3>Pressure</h3>
<!-- display: flex; -->
<div class="div__pressure">
    <svg class="svg__pressure" fill="#fff" width="32" height="32" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.643 6.357c1.747-1.5 3.127-2.686 6.872-.57 1.799 1.016 3.25 1.4 4.457 1.398 2.115 0 3.486-1.176 4.671-2.193a1.037 1.037 0 0 0 .122-1.439.987.987 0 0 0-1.41-.125c-1.746 1.502-3.127 2.688-6.872.57-4.948-2.793-7.266-.803-9.128.797a1.037 1.037 0 0 0-.121 1.439.986.986 0 0 0 1.409.123zm14.712 2.178c-1.746 1.5-3.127 2.688-6.872.57-4.948-2.795-7.266-.804-9.128.795a1.037 1.037 0 0 0-.121 1.439.986.986 0 0 0 1.409.125c1.747-1.501 3.127-2.687 6.872-.572 1.799 1.018 3.25 1.4 4.457 1.4 2.115 0 3.486-1.176 4.671-2.195a1.035 1.035 0 0 0 .122-1.438.986.986 0 0 0-1.41-.124zm0 5.106c-1.746 1.502-3.127 2.688-6.872.572-4.948-2.795-7.266-.805-9.128.795a1.037 1.037 0 0 0-.121 1.439.985.985 0 0 0 1.409.123c1.747-1.5 3.127-2.685 6.872-.57 1.799 1.016 3.25 1.4 4.457 1.4 2.115 0 3.486-1.178 4.671-2.195a1.037 1.037 0 0 0 .122-1.439.988.988 0 0 0-1.41-.125z"/>
    </svg>
    <p>${pressure} <sub>hPa</sub></p>
</div>
    `;
}

async function renderVisibility() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const object = await getForecastData(lat, lon);

    const {list} = object;
    const {visibility} = list[0];

    const visibilityCard = document.querySelector(".today__highlight__list__item.visibility");
    visibilityCard.innerHTML = `
<h3>Visibility</h3>
<!-- display: flex; -->
<div class="div__visibility">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
        <circle fill="#fff" cx="256" cy="256" r="64"/>
        <path fill="#fff" d="M490.84,238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349,110.55,302,96,255.66,96c-42.52,0-84.33,12.15-124.27,36.11C90.66,156.54,53.76,192.23,21.71,238.18a31.92,31.92,0,0,0-.64,35.54c26.41,41.33,60.4,76.14,98.28,100.65C162,402,207.9,416,255.66,416c46.71,0,93.81-14.43,136.2-41.72,38.46-24.77,72.72-59.66,99.08-100.92A32.2,32.2,0,0,0,490.84,238.6ZM256,352a96,96,0,1,1,96-96A96.11,96.11,0,0,1,256,352Z"/>
    </svg>
    <p>${visibility / 1000} <sub>km</sub></p>
</div>  
    `;
}

async function renderFeelsLike() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const object = await getForecastData(lat, lon);

    const {list} = object;
    const {main} = list[0];
    
    const {feels_like: feelsLike} = main;

    const feelsLikeCard = document.querySelector(".feels__like");
    feelsLikeCard.innerHTML = `
<h3>Feels Like</h3>
<!-- display: flex; -->
<div class="div__feels__like">
    <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve" width="32" height="32">
        <g>
        <path d="M30.473,26.115V8.528c0-1.714-0.67-3.326-1.883-4.542c-1.196-1.198-2.853-1.883-4.545-1.883   c-3.526,0-6.397,2.883-6.397,6.426v17.297c-3.558,2.129-5.735,5.948-5.735,10.148c0,6.575,5.35,11.924,11.923,11.924   c6.559,0,11.898-5.349,11.898-11.924C35.724,32.006,33.731,28.295,30.473,26.115z M23.832,45.229c-5.104,0-9.258-4.153-9.258-9.256   c0-3.473,1.917-6.602,5.006-8.171l0.729-0.37V8.528c0-2.071,1.675-3.759,3.729-3.759c0.988,0,1.96,0.401,2.664,1.104   c0.721,0.722,1.099,1.639,1.099,2.654v19.095l0.667,0.385c2.831,1.628,4.589,4.685,4.589,7.966   C33.057,41.078,28.921,45.229,23.832,45.229z"/>
        <path d="M25.326,30.939V14.696c0-0.737-0.596-1.334-1.333-1.334c-0.738,0-1.334,0.597-1.334,1.334v16.138   c-2.386,0.534-4.167,2.654-4.167,5.2c0,2.942,2.39,5.333,5.334,5.333s5.333-2.391,5.333-5.333   C29.159,33.61,27.538,31.592,25.326,30.939z"/>
        <path d="M38.696,12.31h-4.889c-0.735,0-1.335,0.597-1.335,1.333c0,0.735,0.6,1.334,1.335,1.334h4.889   c0.736,0,1.333-0.599,1.333-1.334C40.029,12.907,39.433,12.31,38.696,12.31z"/>
        <path d="M38.696,16.53h-4.889c-0.735,0-1.335,0.599-1.335,1.333c0,0.737,0.6,1.333,1.335,1.333h4.889   c0.736,0,1.333-0.596,1.333-1.333C40.029,17.129,39.433,16.53,38.696,16.53z"/>
        <path d="M38.696,20.752h-4.889c-0.735,0-1.335,0.599-1.335,1.333c0,0.737,0.6,1.334,1.335,1.334h4.889   c0.736,0,1.333-0.597,1.333-1.334C40.029,21.351,39.433,20.752,38.696,20.752z"/>
        </g>
    </svg>
    <p>${feelsLike} <sub>&deg;c</sub></p>
</div>
    `;
}
//#endregion
//#region HOURLY FORECAST
async function renderHourlyForecast() {
    renderTemperatureList();
    renderWindList();
}

async function renderTemperatureList() {
    const temperatureList = document.querySelector(".temperature__list");
    temperatureList.innerHTML = await getTemperatureCardsHTML();
}

async function getTemperatureCardsHTML() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const forecastData = await getForecastData(lat, lon);
    const {list} = forecastData;

    let temperatureCardsHTML = "";

    for (let i = 0; i < list.length; i++) {
        if (i > 7) {
            break;
        }

        const {dt_txt, main, weather} = list[i];
        const {temp} = main;
        const {icon, description} = weather[0];
        temperatureCardsHTML += `
<li class="temperature__list__item temperature__card">
    <p class="hour">${getHourFromDateTime(dt_txt)}</p>
    <img class="weather__icon" src="./images/weather_icons/${icon}.png" width="48" height="48" alt="${description}">
    <p class="temperature">${Math.round(temp)}&deg;c</p>
</li>   
        `;
    }

    return temperatureCardsHTML;
}

async function renderWindList() {
    const windList = document.querySelector(".wind__list");
    windList.innerHTML = await getWindCardsHTML();
}

async function getWindCardsHTML() {
    const {lat, lon} = JSON.parse(localStorage.getItem("currentLocation"));
    const forecastData = await getForecastData(lat, lon);
    const {list} = forecastData;

    let windSpeedCardsHTML = "";
    for (let i = 0; i < list.length; i++) {
        if (i > 7) {
            break;
        }

        const {dt_txt, wind} = list[i];
        const {deg, speed} = wind;

        windSpeedCardsHTML += `
<li class="wind__list__item wind__card">
    <p class="hour">${getHourFromDateTime(dt_txt)}</p>
    <img class="weather__icon" src="./images/weather_icons/direction.png" width="48" height="48" alt="" style="transform: rotate(${deg - 180}deg);">
    <p class="wind__speed">${speed} km/h</p>
</li>  
        `;
    } 

    return windSpeedCardsHTML;
};
//#endregion
//#endregion