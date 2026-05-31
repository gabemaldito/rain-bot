import axios from 'axios';

// Fetches rain forecast from Buienradar API for the given coordinates
export async function searchDataRain(lat: string, lon: string) {
    const url = `https://graphdata.buienradar.nl/2.0/forecast/geo/RainMeteo?lat=${lat}&lon=${lon}`;

    const response = await axios.get(url);
    return response.data;
}