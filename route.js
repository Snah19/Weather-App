import { updateWeather, error404 } from "./app.js";

const defaultLocation = "#/weather?lat=51.5073219&lon=-0.1276474"; // London

function getCurrentLocation() {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;
        updateWeather(`lat=${latitude}`, `lon=${longitude}`);
        }, (err) => {
        window.location.hash = defaultLocation;
    });
}

/**
 * @param {string} query Searched query
 */
function getSearchedLocation(query) {
    updateWeather(...query.split("&"));
    // updateWeather("lat=51.5073219", "lon=-0.1276474")
}

const routes = new Map([
    ["/current-location", getCurrentLocation],
    ["/weather", getSearchedLocation]
]);


function checkHash() {
    const requestURL = window.location.hash.slice(1);

    const [route, query] = requestURL.includes ? requestURL.split("?") : [requestURL];

    routes.get(route) ? routes.get(route)(query) : error404();
}

window.addEventListener("hashchange", checkHash);

window.addEventListener("load", () => {
    if (!window.location.hash) {
        window.location.hash = "#/current-location";
    }
    else {
        checkHash();
    }
});


