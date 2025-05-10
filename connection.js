import { renderMainSection } from "./script.js";

async function getUserLocation() {
    try {
        let userLocation = JSON.parse(localStorage.getItem("userLocation"));

        if (!userLocation) {
            userLocation = await requestHighAccuracyLocation();
            localStorage.setItem("userLocation", JSON.stringify(userLocation));
            console.log(`user location (accurate): lat=${userLocation.lat}, lon=${userLocation.lon}`);
        }

        setCurrentLocationIfUnset(userLocation);

        return true;
    } catch (error) {
        console.error("Error retrieving location:", error);
        return false;
    }
}

function requestHighAccuracyLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lon } = position.coords;
                resolve({ lat, lon });
            },
            (error) => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,           // 10 seconds timeout
                maximumAge: 0             // Do not use cached location
            }
        );
    });
}

function setCurrentLocationIfUnset(location) {
    const currentLocation = JSON.parse(localStorage.getItem("currentLocation"));
    if (!currentLocation) {
        localStorage.setItem("currentLocation", JSON.stringify(location));
    }
}

export async function startOnConnection() {
    if (navigator.onLine) {
        const isSuccess = await getUserLocation();
        if (isSuccess) {
            renderMainSection();
        }
    } else {
        window.addEventListener("online", async () => {
            const isSuccess = await getUserLocation();
            if (isSuccess) {
                renderMainSection();
            }
        });
    }
}
