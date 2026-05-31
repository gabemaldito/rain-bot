import { searchDataRain } from "./services/buienradar.js";
import express, { Request, Response } from "express";
import { Telegraf, Context, Markup } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);
const app = express();
const port = process.env.PORT || 3000;

// Teclado com botão de compartilhar localização
const locationKeyboard = Markup.keyboard([
  [Markup.button.locationRequest("📍 Compartilhar minha localização")],
  [{ text: "❌ Cancelar" }],
])
  .resize()
  .oneTime();

// Teclado vazio (remove o teclado customizado)
const removeKeyboard = Markup.removeKeyboard();

async function verificarChuva(lat: number, lon: number): Promise<string> {
  try {
    const dadosClima = await searchDataRain(
      lat.toFixed(4),
      lon.toFixed(4)
    );

    const momentosChuva = dadosClima.forecasts.filter(
      (item: any) => item.precipitation > 0
    );

    if (momentosChuva.length > 0) {
      const firstMoment = momentosChuva[0];
      const lastMoment = momentosChuva[momentosChuva.length - 1];

      const startTime = firstMoment.datetime.split("T")[1].slice(0, 5);
      const endTime = lastMoment.datetime.split("T")[1].slice(0, 5);

      const maxPrecip = Math.max(
        ...momentosChuva.map((m: any) => m.precipitation)
      );
      const intensidade =
        maxPrecip < 1
          ? "🌦 Leve"
          : maxPrecip < 5
          ? "🌧 Moderada"
          : "⛈ Forte";

      return (
        `🌧 *Alerta de chuva!*\n\n` +
        `⏰ Período: *${startTime}* até *${endTime}*\n` +
        `💧 Intensidade: ${intensidade}\n\n` +
        `_Leve um guarda-chuva! ☂️_`
      );
    } else {
      return (
        `☀️ *Sem chuva prevista!*\n\n` +
        `✅ Pode sair tranquilo — sem chuva nas próximas 2 horas.\n\n` +
        `_Dados: Buienradar_`
      );
    }
  } catch (error) {
    console.error("Erro ao buscar dados de chuva:", error);
    return "❌ Erro ao consultar a previsão. Tente novamente mais tarde.";
  }
}

// /start
bot.command("start", (ctx: Context) => {
  ctx.reply(
    `👋 Olá! Sou o *Rain Bot* 🌧\n\n` +
      `Consulto a previsão de chuva em tempo real usando sua localização!\n\n` +
      `Use /chuva para começar.`,
    { parse_mode: "Markdown", ...removeKeyboard }
  );
});

// /chuva — pede a localização do usuário
bot.command("chuva", (ctx: Context) => {
  ctx.reply(
    `📍 Para verificar a chuva na *sua localização*, toque no botão abaixo:`,
    { parse_mode: "Markdown", ...locationKeyboard }
  );
});

// /ajuda
bot.command("ajuda", (ctx: Context) => {
  ctx.reply(
    `📖 *Ajuda — Rain Bot*\n\n` +
      `*Comandos:*\n` +
      `• /start — boas-vindas\n` +
      `• /chuva — verificar chuva na sua localização\n` +
      `• /ajuda — esta mensagem\n\n` +
      `_O bot usa sua localização GPS para buscar a previsão de chuva nas próximas 2 horas._`,
    { parse_mode: "Markdown" }
  );
});

// Recebe a localização enviada pelo usuário
bot.on("location", async (ctx: Context) => {
  const message = ctx.message as any;
  const { latitude, longitude } = message.location;

  await ctx.reply(`🔍 Consultando previsão para sua localização...`, removeKeyboard);

  const resposta = await verificarChuva(latitude, longitude);
  await ctx.reply(resposta, { parse_mode: "Markdown" });
});

// Cancelar
bot.hears("❌ Cancelar", (ctx: Context) => {
  ctx.reply("Tudo bem! Use /chuva quando quiser consultar.", removeKeyboard);
});

// Mensagem desconhecida
bot.on("text", (ctx: Context) => {
  ctx.reply(`Não entendi. Use /chuva para verificar a previsão de chuva. 🌧`);
});

// Express + Webhook
app.use(express.json());
app.use(bot.webhookCallback("/webhook"));

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "Rain Bot online 🌧",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, async () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);

  const webhookUrl = process.env.WEBHOOK_URL;

  if (webhookUrl) {
    const fullUrl = `${webhookUrl}/webhook`;
    await bot.telegram.setWebhook(fullUrl);
    console.log(`✅ Webhook registrado: ${fullUrl}`);
  } else {
    console.warn("⚠️  WEBHOOK_URL não definida — webhook não foi registrado.");
    console.warn("   Defina WEBHOOK_URL nas variáveis de ambiente do Railway.");
  }
});
