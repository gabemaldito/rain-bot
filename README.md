# 🌧 Rain Bot

A Telegram bot that provides **real-time rain forecasts** based on the user's GPS location, powered by the [Buienradar](https://buienradar.nl) meteorological API.

> Built with **Node.js**, **TypeScript**, **Telegraf**, and **Express** — deployed on **Railway**.

---

## ✨ Features

- 📍 **Native location sharing** — requests the user's GPS directly inside Telegram (no manual typing of coordinates)
- 🌧 **Real-time rain forecast** — checks precipitation for the next 2 hours
- 💧 **Intensity classification** — Light, Moderate, or Heavy rain
- ⏰ **Time window** — shows exact start and end times of the rain period
- ☀️ **Clear weather response** — informs when no rain is expected
- 🔗 **Webhook-based** — uses Telegram webhooks for reliable, low-latency message delivery
- 🚀 **Auto webhook registration** — registers the webhook URL automatically on server startup

---

## 🤖 Bot Commands

| Command | Description |
|---|---|
| `/start` | Welcome message and introduction |
| `/rain` | Request your location and check for rain |
| `/help` | Show help and available commands |

### User Flow

```
User  →  /rain
Bot   →  Shows "Share my location" button (native Telegram UI)
User  →  Taps the button (phone sends GPS coordinates)
Bot   →  Queries Buienradar API with real coordinates
Bot   →  Replies with rain forecast for the next 2 hours
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Bot Framework | [Telegraf v4](https://telegraf.js.org) |
| HTTP Server | Express |
| Weather API | [Buienradar](https://graphdata.buienradar.nl) |
| Deployment | [Railway](https://railway.app) |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
rain-bot/
├── src/
│   ├── index.ts              # Main entry point — Express server + bot logic
│   └── services/
│       └── buienradar.ts     # Buienradar API integration
├── .env                      # Environment variables (not committed)
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 1. Clone the repository

```bash
git clone https://github.com/gabemaldito/rain-bot.git
cd rain-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
WEBHOOK_URL=https://your-public-url.com
```

> `WEBHOOK_URL` must be a **publicly accessible HTTPS URL**. For local development, use [ngrok](https://ngrok.com).

### 4. Run in development mode

```bash
npm run dev
```

### 5. Register the webhook (local development with ngrok)

```bash
# In a separate terminal
ngrok http 3000
```

Then register your webhook manually:
```
https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://<ngrok-url>/webhook
```

> **In production (Railway), the webhook is registered automatically on server startup.**

---

## ☁️ Deploying to Railway

### 1. Push your code to GitHub

Railway connects directly to your GitHub repository.

### 2. Create a new project on [Railway](https://railway.app)

- Click **New Project → Deploy from GitHub repo**
- Select the `rain-bot` repository

### 3. Set environment variables

In your Railway service, go to **Variables** and add:

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your bot token from BotFather |
| `WEBHOOK_URL` | `https://your-project.up.railway.app` |

> Find your public URL under **Settings → Networking → Generate Domain**.

### 4. Deploy

Push any commit to your main branch — Railway will build and deploy automatically.

On startup, the server logs will confirm:
```
🚀 Server running on port 3000
✅ Webhook registered: https://your-project.up.railway.app/webhook
```

---

## 🌐 API Reference

### Buienradar Forecast Endpoint

```
GET https://graphdata.buienradar.nl/2.0/forecast/geo/RainMeteo?lat={lat}&lon={lon}
```

Returns precipitation forecast data for the next 2 hours in 5-minute intervals.

**Example response structure:**
```json
{
  "forecasts": [
    {
      "datetime": "2024-01-01T14:00:00",
      "precipitation": 0.0
    },
    {
      "datetime": "2024-01-01T14:05:00",
      "precipitation": 2.3
    }
  ]
}
```

**Intensity thresholds used:**

| Precipitation (mm/h) | Classification |
|---|---|
| `< 1` | 🌦 Light |
| `1 – 5` | 🌧 Moderate |
| `> 5` | ⛈ Heavy |

---

## 🔒 Health Check

The server exposes a health check endpoint at `/`:

```
GET https://your-project.up.railway.app/
```

```json
{
  "status": "Rain Bot online 🌧",
  "timestamp": "2024-01-01T14:00:00.000Z"
}
```

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Run with hot-reload using `tsx watch` |
| Build | `npm run build` | Compile TypeScript to `dist/` |
| Production | `npm start` | Run compiled output |

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">
  Made with ☁️ and TypeScript by <a href="https://github.com/gabemaldito">gabemaldito</a>
</div>
