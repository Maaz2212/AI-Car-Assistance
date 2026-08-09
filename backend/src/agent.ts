import 'dotenv/config';
import Groq from 'groq-sdk';
import { SessionState, Phase } from './types';
import {
  searchListings,
  showRecommendations,
  startApplication,
  startCheckout,
  updatePreferences,
  updateProgress,
  estimateTradeIn,
  getAllListings,
} from './tools';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Session store ────────────────────────────────────────────────────────────
const sessions = new Map<string, SessionState>();
const sessionHistory = new Map<string, Groq.Chat.ChatCompletionMessageParam[]>();

export function getOrCreateSession(sessionId: string): SessionState {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      phase: 'interview',
      preferences: { intent: null, useCase: null, category: null, budget: null, targetDate: null, mustHaves: [] },
      searchResults: [],
      recommendations: [],
      selectedListingId: null,
      tradeIn: null,
      comparedCarIds: [],
      application: null,
      paymentStatus: null,
    });
    sessionHistory.set(sessionId, []);
  }
  return sessions.get(sessionId)!;
}

// ─── Welcome message ─────────────────────────────────────────────────────────
export function buildWelcomeMessage(): { text: string; suggestions: string[] } {
  const total = getAllListings().length;
  return {
    text:
      `👋 Welcome to **CarMatch — AI Vehicle Concierge**!\n\n` +
      `I'm powered by **Llama 3.3 (Groq)** and can search through **${total}+ active listings** across 12 categories.\n\n` +
      `🚗 **Categories:** Sedan • SUV • Compact • Truck • Minivan • Coupe • Convertible • Electric • Hybrid • Luxury • Sports Car • Off-Road\n\n` +
      `💡 **Try saying:**\n` +
      `• *"I want to buy a Sedan under $25k"*\n` +
      `• *"I have a 2019 Civic to trade in"*\n` +
      `• *"Compare car-001 and car-002"*\n\n` +
      `What type of vehicle are you looking for today?`,
    suggestions: ['Buy a Sedan under $25k', 'Trade-in my 2019 Civic', 'Show Electric cars under $45k', 'Show all SUV options'],
  };
}

// ─── Tool definitions (JSON Schema format for Groq API) ─────────────────────
const TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'updatePreferences',
      description: 'Store the user\'s vehicle preferences. Call whenever user mentions intent (buy/rent), category, budget, or use case.',
      parameters: {
        type: 'object',
        properties: {
          intent: { type: 'string', enum: ['buy', 'rent'], description: 'Whether user wants to buy or rent' },
          category: { type: 'array', items: { type: 'string' }, description: 'Vehicle categories e.g. Sedan, SUV, Electric, Luxury, Hybrid, Sports Car' },
          budgetMax: { type: 'number', description: 'Maximum budget in USD' },
          budgetMin: { type: 'number', description: 'Minimum budget in USD (usually 0)' },
          useCase: { type: 'string', description: 'Use case e.g. family, commuting, off-road' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchCars',
      description: 'Search the CarMatch database for vehicles. Call this after collecting intent and/or category to find real listings.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'array', items: { type: 'string' }, description: 'Categories to search' },
          intent: { type: 'string', enum: ['buy', 'rent'], description: 'Buy or rent' },
          maxBudget: { type: 'number', description: 'Max price filter' },
          ignorebudget: { type: 'boolean', description: 'True to show all regardless of budget' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendCars',
      description: 'Display ranked car recommendations on the UI. Call AFTER searchCars returns results.',
      parameters: {
        type: 'object',
        properties: {
          carIds: { type: 'array', items: { type: 'string' }, description: 'Car IDs to recommend (from search results)' },
          reasonings: { type: 'array', items: { type: 'string' }, description: 'Reasoning for each car' },
          scores: { type: 'array', items: { type: 'number' }, description: 'Match score (0-100) for each car' },
        },
        required: ['carIds', 'reasonings', 'scores'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'estimateTradeIn',
      description: 'Estimate trade-in value when user mentions they have a car to trade.',
      parameters: {
        type: 'object',
        properties: {
          year: { type: 'number', description: 'Year of trade-in vehicle' },
          brand: { type: 'string', description: 'Brand e.g. Honda, Toyota' },
          model: { type: 'string', description: 'Model e.g. Civic, Camry' },
        },
        required: ['year', 'brand', 'model'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'openApplicationForm',
      description: 'Open the application/booking form for a specific car. Call when user selects a car to apply for.',
      parameters: {
        type: 'object',
        properties: {
          carId: { type: 'string', description: 'Car listing ID e.g. car-001, car-etron-gt' },
        },
        required: ['carId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clearTradeIn',
      description: 'Remove the trade-in vehicle so prices return to standard listing prices.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'closeForm',
      description: 'Close the current form and return user to browsing.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// ─── Tool executor ────────────────────────────────────────────────────────────
async function executeTool(
  name: string,
  args: any,
  session: SessionState,
  onA2UI: (msgs: any[]) => void
): Promise<string> {
  try {
    switch (name) {
      case 'updatePreferences': {
        const { updatedPrefs, a2uiMessages } = updatePreferences(session, {
          intent: args.intent,
          category: args.category,
          budget: args.budgetMax ? { min: args.budgetMin ?? 0, max: args.budgetMax, currency: 'USD' } : undefined,
          useCase: args.useCase,
        });
        onA2UI(a2uiMessages);
        return JSON.stringify({ success: true, stored: updatedPrefs });
      }

      case 'searchCars': {
        const progressMsgs = updateProgress(session, 'researching', 'Searching CarMatch marketplace...');
        onA2UI(progressMsgs);
        const { results, cheapestInCategory, cheapestPrice, totalInCategory } = searchListings(session, {
          category: args.category,
          intent: args.intent ?? session.preferences.intent,
          maxBudget: args.maxBudget,
          ignorebudget: args.ignorebudget,
        });
        const top8 = results.slice(0, 8);
        const intent = args.intent ?? session.preferences.intent ?? 'buy';
        const summary = top8.map((c, i) => {
          const priceStr = intent === 'rent' ? `$${c.dailyRate}/day` : c.price ? `$${c.price.toLocaleString()}` : 'Contact for price';
          return `${i + 1}. ID:${c.id} — ${c.year} ${c.brand} ${c.model} (${c.category}) · ${c.color} · ${priceStr} · ${c.condition} · ${c.location}`;
        });
        return JSON.stringify({ totalFound: results.length, showing: top8.length, cheapestAvailable: cheapestPrice, results: summary, hasMore: results.length > 8 });
      }

      case 'recommendCars': {
        const recs = (args.carIds || []).map((id: string, i: number) => ({
          listingId: id,
          score: args.scores?.[i] ?? 80,
          reasoning: args.reasonings?.[i] ?? 'Great match for your needs',
        }));
        const { a2uiMessages } = showRecommendations(session, recs);
        onA2UI(a2uiMessages);
        return JSON.stringify({ success: true, recommended: recs.length });
      }

      case 'estimateTradeIn': {
        const value = estimateTradeIn(args.year, args.brand, args.model);
        session.tradeIn = { year: args.year, brand: args.brand, model: args.model, estimatedValue: value };
        if (session.recommendations.length > 0) {
          const { a2uiMessages } = showRecommendations(session, session.recommendations);
          onA2UI(a2uiMessages);
        }
        return JSON.stringify({ vehicle: `${args.year} ${args.brand} ${args.model}`, estimatedValue: value, formattedValue: `$${value.toLocaleString()}` });
      }

      case 'openApplicationForm': {
        const { a2uiMessages } = startApplication(session, args.carId);
        onA2UI(a2uiMessages);
        return JSON.stringify({ success: true, formOpenedFor: args.carId });
      }

      case 'clearTradeIn': {
        session.tradeIn = null;
        if (session.recommendations.length > 0) {
          const { a2uiMessages } = showRecommendations(session, session.recommendations);
          onA2UI(a2uiMessages);
        }
        return JSON.stringify({ success: true });
      }

      case 'closeForm': {
        session.selectedListingId = null;
        session.phase = session.recommendations.length > 0 ? 'recommending' : 'interview';
        if (session.recommendations.length > 0) {
          const { a2uiMessages } = showRecommendations(session, session.recommendations);
          onA2UI(a2uiMessages);
        } else {
          onA2UI(updateProgress(session, 'interview', 'Gathering preferences...'));
        }
        return JSON.stringify({ success: true });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message });
  }
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(session: SessionState): string {
  const prefs = session.preferences;
  return `You are CarMatch AI — a premium vehicle concierge. Help users find, compare, and apply for vehicles.

RULES:
- ALWAYS use tools — never fabricate car data.
- After user mentions intent + category: call updatePreferences THEN searchCars THEN recommendCars.
- When recommending: pick 3-6 cars from the search results list by their exact IDs. Provide genuine reasoning and scores.
- For trade-ins: call estimateTradeIn.
- When user says "apply for car-XXX" or "book car-XXX": call openApplicationForm.
- Use **bold** for car names and prices in your text replies.

SESSION STATE:
- Phase: ${session.phase}
- Intent: ${prefs.intent ?? 'not set'}
- Categories: ${prefs.category?.join(', ') ?? 'not set'}
- Budget: ${prefs.budget ? `$${prefs.budget.max.toLocaleString()}` : 'not set'}
- Trade-in: ${session.tradeIn ? `${session.tradeIn.year} ${session.tradeIn.brand} ${session.tradeIn.model} = $${session.tradeIn.estimatedValue.toLocaleString()}` : 'none'}
- Results loaded: ${session.searchResults.length}`;
}

// ─── Main process function with manual multi-step tool loop ──────────────────
export async function processUserMessage(
  sessionId: string,
  userText: string,
  onToken: (token: string) => void,
  onA2UI: (msgs: any[]) => void,
  onSuggestions: (chips: string[]) => void
): Promise<SessionState> {
  const session = getOrCreateSession(sessionId);
  const history = sessionHistory.get(sessionId)!;

  // Add user message
  history.push({ role: 'user', content: userText });

  let finalText = '';

  try {
    // Multi-step agentic loop (up to 8 steps)
    for (let step = 0; step < 8; step++) {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: buildSystemPrompt(session) },
          ...history,
        ],
        tools: TOOLS,
        tool_choice: 'auto',
        max_tokens: 1024,
        temperature: 0.3,
      });

      const choice = response.choices[0];
      const message = choice.message;

      // Add assistant turn to history
      history.push(message as any);

      // If no tool calls — final text response
      if (!message.tool_calls || message.tool_calls.length === 0) {
        finalText = message.content || '';
        break;
      }

      // Execute all tool calls in this step
      const toolResultMessages: Groq.Chat.ChatCompletionMessageParam[] = [];
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs: any = {};
        try { toolArgs = JSON.parse(toolCall.function.arguments || '{}'); } catch { toolArgs = {}; }

        console.log(`[Agent] Step ${step + 1} — calling tool: ${toolName}`, toolArgs);
        const result = await executeTool(toolName, toolArgs, session, onA2UI);

        toolResultMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        } as any);
      }

      // Add tool results to history for next step
      history.push(...toolResultMessages);

      // If the model said stop or we hit final step, break
      if (choice.finish_reason === 'stop') break;
    }

    // Trim history to last 30 messages
    if (history.length > 60) history.splice(0, history.length - 60);
    sessionHistory.set(sessionId, history);

    // Stream the final text response
    if (finalText) {
      const words = finalText.split(' ');
      for (let i = 0; i < words.length; i++) {
        onToken(words[i] + (i < words.length - 1 ? ' ' : ''));
        await new Promise((r) => setTimeout(r, 8));
      }
    }

  } catch (err: any) {
    console.error('[Agent Error]', err.message);
    const errMsg = `⚠️ Something went wrong: ${err.message?.substring(0, 100)}. Please try again.`;
    for (const word of errMsg.split(' ')) {
      onToken(word + ' ');
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  onSuggestions(buildSuggestions(session));
  return session;
}

// ─── Smart suggestions ────────────────────────────────────────────────────────
function buildSuggestions(session: SessionState): string[] {
  const { phase, preferences: prefs, searchResults, tradeIn } = session;
  if (phase === 'done') return ['Start a new search', 'Book another vehicle'];
  if (phase === 'payment') return ['Confirm payment', 'Go back to search'];
  if (phase === 'form') return ['Submit application', 'Choose a different car'];
  if (!prefs.intent) return ['I want to buy a car', 'I want to rent a car', 'Show all listings', 'Browse luxury cars'];
  if (!prefs.category?.length) return ['Show me Sedans', 'Show me SUVs', 'Show me Electric cars', 'Show me Hybrid cars'];
  if (!prefs.budget) return ['Budget under $20k', 'Budget under $35k', 'Budget under $50k', 'Flexible budget'];
  const chips: string[] = [];
  if (searchResults.length > 0) {
    chips.push('Show more options');
    if (!tradeIn) chips.push('I have a trade-in');
    chips.push(prefs.intent === 'buy' ? 'Switch to renting' : 'Switch to buying');
    chips.push('Change my budget');
  } else {
    chips.push('Raise my budget', 'Try a different category', 'Show all listings');
  }
  return chips.slice(0, 4);
}

// ─── Application & Payment handlers ─────────────────────────────────────────
export function handleApplicationSubmit(sessionId: string, formData: Record<string, unknown>) {
  const session = getOrCreateSession(sessionId);
  session.application = formData;
  const { a2uiMessages } = startCheckout(session, `APP-${Date.now().toString().slice(-4)}`);
  return { session, a2uiMessages };
}

export function handlePaymentSubmit(sessionId: string, _paymentData: Record<string, unknown>) {
  const session = getOrCreateSession(sessionId);
  session.paymentStatus = 'confirmed';
  session.phase = 'done';
  const a2uiMessages = updateProgress(session, 'done', 'Confirmed!');
  return { session, a2uiMessages };
}
