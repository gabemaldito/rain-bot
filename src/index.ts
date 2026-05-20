import { searchDataRain } from "./services/buienradar.js";

async function run() {
  const dadosClima = await searchDataRain('52.09', '5.12');

  const momentosChuva = dadosClima.forecasts.filter()
  
  console.log(dadosClima.forecasts);
}
run();


