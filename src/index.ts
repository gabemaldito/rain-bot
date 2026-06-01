import { searchDataRain } from "./services/buienradar.js";
import express, { Request, Response } from "express";
import { Telegraf, Context, Markup } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);
const app = express();
const port = process.env.PORT || 3000;

// Keyboard with location sharing button
const locationKeyboard = Markup.keyboard([
  [Markup.button.locationRequest("📍 Share my location")],
  [{ text: "❌ Cancel" }],
])
  .resize()
  .oneTime();

// Empty keyboard (removes the custom keyboard)
const removeKeyboard = Markup.removeKeyboard();

async function checkRain(lat: number, lon: number): Promise<string> {
  try {
    const weatherData = await searchDataRain(
      lat.toFixed(4),
      lon.toFixed(4)
    );

    // 🛑 TRAVA DE SEGURANÇA: Se a API falhar ou a coordenada for fora da Europa (Brasil)
    if (!weatherData || !weatherData.forecasts) {
      return (
        `🗺️ *Location outside coverage area*\n\n` +
        `Sorry! Buienradar only provides accurate rain forecasts for the Netherlands and parts of Northwestern Europe.\n\n` +
        `_Your coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}_`
      );
    }

    const rainyPeriods = weatherData.forecasts.filter(
      (item: any) => item.precipitation > 0
    );

    if (rainyPeriods.length > 0) {
      const firstMoment = rainyPeriods[0];
      const lastMoment = rainyPeriods[rainyPeriods.length - 1];

      const startTime = firstMoment.datetime.split("T")[1].slice(0, 5);
      const endTime = lastMoment.datetime.split("T")[1].slice(0, 5);

      const maxPrecip = Math.max(
        ...rainyPeriods.map((m: any) => m.precipitation)
      );

      const intensity =
        maxPrecip < 1
          ? "🌦 Light"
          : maxPrecip < 5
          ? "🌧 Moderate"
          : "⛈ Heavy";

      return (
        `🌧 *Rain alert!*\n\n` +
        `⏰ Period: *${startTime}* until *${endTime}*\n` +
        `💧 Intensity: ${intensity}\n\n` +
        `_Don't forget your umbrella! ☂️_`
      );
    } else {
      return (
        `☀️ *No rain expected!*\n\n` +
        `✅ You're good to go — no rain forecast for the next 2 hours.\n\n` +
        `_Powered by Buienradar_`
      );
    }
  } catch (error) {
    console.error("Error inside checkRain logic:", error);
    return "❌ Failed to process the forecast. Please try again later.";
  }
}

// /start
bot.command("start", (ctx: Context) => {
  ctx.reply(
    `👋 Hey! I'm *Rain Bot* 🌧\n\n` +
      `I provide real-time rain forecasts based on your location!\n\n` +
      `Use /rain to get started.`,
    { parse_mode: "Markdown", ...removeKeyboard }
  );
});

// /rain — requests the user's location
bot.command("rain", (ctx: Context) => {
  ctx.reply(
    `📍 To check the rain forecast at *your location*, tap the button below:`,
    { parse_mode: "Markdown", ...locationKeyboard }
  );
});

// /help
bot.command("help", (ctx: Context) => {
  ctx.reply(
    `📖 *Help — Rain Bot*\n\n` +
      `*Commands:*\n` +
      `• /start — welcome message\n` +
      `• /rain — check rain at your location\n` +
      `• /help — this message\n\n` +
      `_The bot uses your GPS location to fetch the rain forecast for the next 2 hours._`,
    { parse_mode: "Markdown" }
  );
});

// Receives the location shared by the user
bot.on("location", async (ctx: Context) => {
  const message = ctx.message as any;
  const { latitude, longitude } = message.location;

  await ctx.reply(`🔍 Fetching forecast for your location...`, removeKeyboard);

  const response = await checkRain(latitude, longitude);
  await ctx.reply(response, { parse_mode: "Markdown" });
});

// Cancel button handler
bot.hears("❌ Cancel", (ctx: Context) => {
  ctx.reply("No problem! Use /rain whenever you want to check the forecast.", removeKeyboard);
});

// Unknown messages

// Express + Webhook setup
app.use(express.json());
app.use(bot.webhookCallback("/webhook"));

// Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "Rain Bot online 🌧",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, async () => {
  console.log(`🚀 Server running on port ${port}`);

  const webhookUrl = process.env.WEBHOOK_URL;

  if (webhookUrl) {
    const fullUrl = `${webhookUrl}/webhook`;
    await bot.telegram.setWebhook(fullUrl);
    console.log(`✅ Webhook registered: ${fullUrl}`);
  } else {
    console.warn("⚠️  WEBHOOK_URL is not set — webhook was not registered.");
    console.warn("   Set WEBHOOK_URL in your environment variables.");
  }
});
