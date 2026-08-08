# Project Constitution — AI Car Matchmaker

This document outlines the non-negotiable hard requirements and architectural boundaries for the **AI Car Matchmaker** application.

---

## 1. Non-Negotiable Hard Requirements

1. **Conversational Multi-Step Interview First:**
   - The agent must conversationally interview the user before recommending cars.
   - Slot-filling priorities: `intent` (buy/rent), `useCase`, `category`, `budget` (min/max), `targetDate`.
   - Never overwrite captured preferences; only fill missing gaps.
   - Never re-ask information the user has already provided.

2. **State Persistence Across All 4 Phases:**
   - State loop: `interview` $\rightarrow$ `researching` $\rightarrow$ `recommending` $\rightarrow$ `form` / `payment` $\rightarrow$ `done`.
   - Backend session state strictly tracks phase transitions and user preferences.

3. **Generative UI via A2UI Protocol:**
   - Car catalogue, search status, and interview progress dial must be driven by A2UI protocol messages (`createSurface`, `updateComponents`, `updateDataModel`).
   - Standard React components (`GaugeDial`, `CarCard`) consume A2UI protocol messages.
   - LLMs must **NEVER** freehand raw A2UI JSON directly. Instead, agent tool calls trigger deterministic, server-side template functions (`buildCatalogueMessages`, `buildProgressMessages`).

4. **MCP Apps for Form & Payment:**
   - Application form fill and mock checkout payment flows must run inside sandboxed MCP Apps (`<iframe srcdoc>`).
   - Single-MCP-client backend pattern: Sandboxed MCP App iframe uses `postMessage` $\rightarrow$ Next.js host relays over WebSocket $\rightarrow$ Backend executes MCP tool $\rightarrow$ Response relayed back.
   - No real payment processing, no real external car APIs — everything is cleanly mocked.

5. **Dataset Scale & Quality:**
   - Mock dataset (`data/listings.json`) must contain $\ge 100$ listings across $\ge 10$ car categories and $\ge 10$ brands per category.

---

## 2. Technical Stack Boundaries

- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS + `@a2ui/react`.
- **Backend:** Node.js + Express + WebSocket (`ws`) + `@modelcontextprotocol/sdk`.
- **Styling:** Dark, glassy night-showroom theme (`#0B0C10` to `#14182B` mesh gradient, `#FFB020` amber progress accents, `#33D6A6` teal match accents, off-white `#F4F3EF` spec text, technical monospace for specs).
