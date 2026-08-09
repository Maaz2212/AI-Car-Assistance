# CarMatch — AI Vehicle Concierge

CarMatch is a modern, AI-powered vehicle matchmaker built with **Next.js 14**, **Node.js**, **TypeScript**, and a multi-step agent powered by **Groq (Llama 3.3 70B)**. It helps users search, compare, appraise trade-ins, and apply for 380+ listings across 12 car categories.

---

## ⚡ Quick Start (Docker - 1 Command)

No manual setup required. Clone the repo and open docker app and then go into terminal and type:

```bash
docker compose up --build
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

> Everything (dataset generation, frontend build, backend WS server, and agent orchestration) runs automatically out of the box.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ Client (Next.js - Port 3000)                                           │
│ ┌──────────────────────┐ ┌────────────────────┐ ┌───────────────────┐  │
│ │ Chat Thread & Chips  │ │ Showroom Catalogue │ │ Compare & TradeIn │  │
│ └──────────┬───────────┘ └─────────┬──────────┘ └─────────┬─────────┘  │
│            └────────────────── WebSocket ─────────────────┘            │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────┴───────────────────────────────────┐
│ Backend Agent Server (Node.js - Port 3001)                             │
│ - Multi-step Groq/Llama 3.3 agent with tool-calling loop              │
│ - Session state, trade-in valuation & preference persistence           │
│ - REST API endpoints for application & payment workflows               │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │  Groq Cloud API      │
                          │  llama-3.3-70b       │
                          └─────────────────────┘
```

---

## 🛠️ Alternative Local Setup

If running locally without Docker:

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set your Groq API key in `.env`:**
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Start backend and frontend:**
   ```bash
   # Terminal 1: Backend (Port 3001)
   npm run dev:backend

   # Terminal 2: Frontend (Port 3000)
   cd frontend && npm run dev
   ```

---

## 🌟 Key Features

- **Multi-Step AI Agent**: Autonomous function-calling agent using Groq's Llama 3.3 70B model.
- **Conversational Inventory Search**: Filter 380+ vehicles by intent (buy/rent), category, and budget.
- **Smart Trade-in Valuation**: Input current vehicle details to calculate estimated trade-in offset and update net prices across all listings.
- **Interactive Showroom & Detailed Specs**: View high-res cards, detailed telemetry, and apply directly.
- **Side-by-Side Comparison**: Compare specs and feature badges between any 2 vehicles.
- **A2UI Dynamic Surfaces**: Real-time progress dials, interactive cards, and contextual suggestion chips streamed over WebSockets.

---

## 🤖 Agent Tools

| Tool | Description |
|------|-------------|
| `updatePreferences` | Saves user intent, category, and budget limits |
| `searchCars` | Queries live vehicle database |
| `recommendCars` | Pushes ranked cards with AI reasoning to the UI |
| `estimateTradeIn` | Calculates trade-in appraisal & net pricing |
| `openApplicationForm` | Opens reservation/booking form |
| `clearTradeIn` | Resets pricing to standard listing rates |
| `closeForm` | Returns user to search floor |

---

## 📁 Project Structure

```
CarAssistance/
├── backend/            # Express, WebSocket server & Groq Llama 3.3 agent
├── frontend/           # Next.js 14 glassmorphic UI components
├── data/               # Car listings dataset
├── scripts/            # Synthetic data generator script
├── docker-compose.yml  # One-command Docker orchestration
└── Dockerfile          # Multi-stage build specification
```
