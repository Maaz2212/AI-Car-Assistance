# 🏎️ AI Car Matchmaker — 2-Day Hackathon Build

> A chat-based multistep AI concierge that interviews users about buying/renting vehicles, searches a live mock marketplace of 128+ listings, renders ranked recommendations with personalized reasoning using **A2UI** (agent-to-UI protocol), and handles inline application form filling & mock checkout payment via **sandboxed MCP Apps**.

---

## 🚀 Quickstart for Judges (Docker Compose)

Any judge with Docker installed can clone the repository and run **one single command**:

```bash
docker compose up --build
```
*(Or `docker-compose up --build` on older Docker CLI versions)*

Once Docker finishes building, open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🌟 System Architecture

```
┌──────────────────────────────── Browser ────────────────────────────────┐
│ Next.js Chat Host (Port 3000)                                           │
│ ┌───────────────┐ ┌───────────────────────┐ ┌───────────────────┐       │
│ │ Chat Thread   │ │ A2UI Showroom Canvas  │ │ MCP App Sandbox   │       │
│ │ (messages)    │ │ - GaugeDial Progress  │ │ <iframe srcdoc>   │       │
│ │               │ │ - CarCard Catalogue   │ │ - Application Form│       │
│ │               │ │                       │ │ - Mock Checkout   │       │
│ └───────┬───────┘ └───────────┬───────────┘ └─────────┬─────────┘       │
│         └───────────────── Single WebSocket ───────────┘                 │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
┌───────────────────────────────── Backend ──────────────────────────────┐
│ Agent Orchestrator (Port 3001)                                          │
│ - Owns session state loop (interview -> research -> recommend -> book)  │
│ - Deterministic A2UI protocol message builder                            │
│ - Single MCP Client & tool call relay gateway                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Hard Requirements Compliance Matrix (§2)

| Requirement | Implementation Status | Notes |
| :--- | :---: | :--- |
| **Conversational Interview First** | ✅ COMPLETED | Agent asks about intent (buy/rent), use case, category, budget, date before searching. |
| **Ranked Recommendations & Reasoning** | ✅ COMPLETED | Each card has match score badge (%) and italicized personalized reasoning string tied to preferences. |
| **Form-Filling MCP App** | ✅ COMPLETED | Application form rendered in sandboxed `<iframe srcdoc>` via MCP protocol relay. |
| **Mock Payment/Checkout MCP App** | ✅ COMPLETED | Demo checkout rendered in sandboxed `<iframe srcdoc>` via MCP protocol relay. |
| **A2UI Protocol Generative UI** | ✅ COMPLETED | Uses `@a2ui/react` for `GaugeDial` 4-stage progress indicator and `CarCard` catalogue grid. |
| **Mock Marketplace Dataset** | ✅ COMPLETED | 128 listings generated across 12 categories & 17 brands (`data/listings.json`). |
| **State Persistence Across 4 Phases** | ✅ COMPLETED | Session state persists phase, captured preferences, search results, selected listing, and payment status. |
| **Spec-Driven & Docker Ready** | ✅ COMPLETED | `constitution.md`, `Dockerfile`, and `docker-compose.yml` fully configured. |

---

## 🎬 7-Step Hackathon Demo Script (§13)

1. **Open App:** Navigate to `http://localhost:3000` with a fresh session.
2. **Conversational Interview:** Answer the agent's questions naturally (e.g., *"Looking to buy an SUV under $40k for daily commute"*).
3. **Live A2UI Progress & Catalogue:** Watch the `GaugeDial` move from **Interview** $\rightarrow$ **Research** $\rightarrow$ **Recommend**. The showroom floor populates with glass `CarCard` items, each displaying a match score and personalized reasoning line.
4. **Select Car:** Click **Apply & Rent / Buy** on a card (or type *"Select car-001"*).
5. **Form-Fill MCP App:** Watch the Application Form open inline in the sandboxed iframe. Submit applicant details.
6. **Payment MCP App:** Watch the Mock Checkout window render deposit fields. Click **Confirm Booking Deposit**.
7. **Booking Summary:** Observe the agent confirming your booking code and summary in chat, proving session state persisted seamlessly across all 4 phases.

---

## 🛠️ Local Development (Without Docker)

If running without Docker, execute:

```bash
# 1. Install & Generate Dataset
npm install && cd frontend && npm install && cd ..
npm run generate:data

# 2. Run via one command
./start.sh
```
