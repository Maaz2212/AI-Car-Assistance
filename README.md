# AI Car Assistance & Matchmaker

An intelligent, conversational vehicle matchmaker and purchasing assistant built with Next.js, Node.js, and TypeScript. The application guides users through an interactive process to find, compare, and apply for buying or renting vehicles from a dataset of 370+ listings across 12 categories.

---

## 🌟 Features

- **Conversational Search & Filtering**: Interview-driven slot filling for vehicle intent (buy vs. rent), body style, budget limits, fuel type, and specific user preferences.
- **Strict Budget & Category Matching**: Enforces budget constraints with fallback recommendations and transparent alternative suggestions when exact matches are unavailable.
- **Dynamic Catalogue UI**: Interactive vehicle cards featuring specs, colors, match confidence scoring, and personalized recommendation rationale.
- **Contextual Suggestion Chips**: Dynamic, data-driven quick replies generated after each turn based on search results and inventory state.
- **Integrated Application & Checkout**: Streamlined inline workflow for vehicle application submission and booking confirmation.
- **Docker Ready**: Single-command containerized deployment using Docker Compose.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ Client (Next.js - Port 3000)                                           │
│ ┌──────────────────────┐ ┌────────────────────┐ ┌───────────────────┐  │
│ │ Chat Thread & Chips  │ │ Showroom Catalogue │ │ Application Form  │  │
│ └──────────┬───────────┘ └─────────┬──────────┘ └─────────┬─────────┘  │
│            └────────────────── WebSocket ─────────────────┘            │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────┴───────────────────────────────────┐
│ Backend & Agent Orchestrator (Node.js - Port 3001)                     │
│ - Session state management & preference extraction                     │
│ - Multi-step recommendation engine & strict filter pipeline             │
│ - REST API endpoints for application submission & payment gateway      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, WebSocket (`ws`), TypeScript
- **Dataset**: Local JSON repository generator (`scripts/generate-listings.ts`)
- **Containerization**: Docker, Docker Compose

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Docker Desktop

---

### Option 1: Docker Compose (Recommended)

Run the full application stack in a single container:

```bash
docker compose up --build
```

Access the application at: **[http://localhost:3000](http://localhost:3000)**

---

### Option 2: Local Development

1. **Install dependencies:**

```bash
npm run install:all
```

2. **Generate the mock dataset:**

```bash
npm run generate:data
```

3. **Start the application services:**

```bash
./start.sh
```

Or start the backend and frontend separately:

```bash
# Terminal 1 (Backend Server - Port 3001)
npm run start:backend

# Terminal 2 (Frontend App - Port 3000)
npm run start:frontend
```

---

## 📁 Project Structure

```
CarAssistance/
├── backend/
│   └── src/
│       ├── agent.ts            # Agent orchestrator & intent processing
│       ├── tools.ts            # Marketplace search & filter utilities
│       ├── a2ui-templates.ts   # UI component state generators
│       ├── server.ts           # Express REST & WebSocket server
│       └── types.ts            # Data models and session state definitions
├── frontend/
│   ├── app/                    # Next.js App Router pages & layout
│   ├── components/             # React UI components (CarCard, ChatThread, GaugeDial, etc.)
│   └── public/                 # Static assets
├── scripts/
│   └── generate-listings.ts    # Synthetic vehicle dataset generator
├── data/
│   └── listings.json           # Active inventory dataset (370+ vehicles)
├── docker-compose.yml          # Container deployment specification
├── Dockerfile                  # Multi-stage production container build
└── start.sh                    # Startup script for concurrent local execution
```

---

## 📡 API & WebSocket Protocols

### WebSocket (`ws://localhost:3001/ws`)

- **Incoming Messages**:
  - `{ type: 'chat_token', sessionId: string, token: string }`
- **Outgoing Events**:
  - `session_state`: Transmits current session state and preferences.
  - `chat_token`: Streams response text tokens.
  - `chat_end`: Signals message completion with contextual suggestion chips.
  - `a2ui_messages`: Transmits UI updates for progress indicators and vehicle cards.

### REST Endpoints

- `POST /api/application/submit` — Handles vehicle application submission.
- `POST /api/payment/confirm` — Confirms booking deposit and updates order status.
- `GET /` & `GET /api/health` — Service status check.
