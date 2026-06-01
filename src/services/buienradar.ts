import axios from "axios";

// Fetches rain forecast from Buienradar API for the given coordinates
export async function searchDataRain(lat: string, lon: string) {
  const url = `https://graphdata.buienradar.nl/2.0/forecast/geo/RainMeteo?lat=${lat}&lon=${lon}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    // Captura o erro para o bot não quebrar
    console.error(
      `[Buienradar] Erro ao buscar dados de chuva para lat:${lat} lon:${lon}. Status: ${error.response?.status || error.message}`,
    );

    // Retorna null ou um objeto vazio para o seu index.js saber que não há dados de chuva
    return null;
  }
}
