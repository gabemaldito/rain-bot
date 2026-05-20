import { searchDataRain } from "./services/buienradar.js";

async function run() {
  const dadosClima = await searchDataRain('52.09', '5.12');

    //filter and rain moments
  const momentosChuva = dadosClima.forecasts.filter((item:any) => item.precipitation > 0);
    
    //check if the list have elements
    if(momentosChuva.length > 0){
        const firstMoment = momentosChuva[0];
        const lastMoment = momentosChuva[momentosChuva.length - 1];

        const startTime = firstMoment.datetime.split('T')[1].slice(0, 5);
        const endTime = lastMoment.datetime.split('T')[1].slice(0, 5);
        
        console.log(`Alerta! Vai chover de ${startTime} até ${endTime}`);
    }else{
        console.log("Pode sair tranquilo, sem previsão de chuva para as próximas 2 horas!");
    }

  console.log(dadosClima.forecasts);
}
run();


