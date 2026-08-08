import { Listing, SessionState } from './types';
import {
  searchListings,
  showRecommendations,
  startApplication,
  startCheckout,
  updatePreferences,
  updateProgress,
  getAllListings,
} from './tools';

// Build smart, data-driven suggestions based on what's actually in the dataset
function generateSuggestions(session: SessionState, cheapestInCategory: Listing | null, cheapestPrice: number | null, resultsFound: number): string[] {
  const prefs = session.preferences;
  const phase = session.phase;
  const intent = prefs.intent || 'buy';

  if (phase === 'done') return ['Start a new search', 'Book another vehicle'];
  if (phase === 'payment') return ['Confirm payment', 'Go back to search'];
  if (phase === 'form') return ['Submit application', 'Choose a different car'];

  const suggestions: string[] = [];

  if (resultsFound === 0 && cheapestPrice !== null) {
    // No results — offer data-driven budget raise
    const suggestedBudget = Math.ceil(cheapestPrice * 1.1 / 1000) * 1000;
    suggestions.push(`Raise budget to $${suggestedBudget.toLocaleString()}`);
    if (cheapestInCategory) {
      suggestions.push(`Show cheapest ${cheapestInCategory.category} (from $${cheapestPrice?.toLocaleString()})`);
    }
    suggestions.push('Search a different category');
    suggestions.push('Switch to renting instead');
    return suggestions;
  }

  if (resultsFound > 0 && prefs.budget?.max) {
    // Results found — offer to adjust
    const lowerBudget = Math.floor(prefs.budget.max * 0.75 / 1000) * 1000;
    const higherBudget = Math.ceil(prefs.budget.max * 1.3 / 1000) * 1000;
    if (lowerBudget >= 5000) suggestions.push(`Tighten budget to $${lowerBudget.toLocaleString()}`);
    suggestions.push(`Raise budget to $${higherBudget.toLocaleString()} for more options`);
  }

  if (!prefs.intent) return ['I want to buy a car', 'I want to rent a car', 'Show all listings'];
  if (!prefs.category?.length) return ['Show me Sedans', 'Show me SUVs', 'Show me Electric cars', 'Show me Hybrids'];
  if (!prefs.budget) return ['Budget under $20k', 'Budget under $35k', 'Budget under $50k', 'Flexible budget'];

  // Category switches
  const categories = ['Sedan', 'SUV', 'Electric', 'Hybrid', 'Luxury', 'Sports Car', 'Truck/Pickup', 'Compact/Hatchback', 'Off-Road/4x4'];
  const currentCats = prefs.category || [];
  const otherCats = categories.filter((c) => !currentCats.includes(c));
  if (otherCats.length > 0) suggestions.push(`Show me ${otherCats[0]}s instead`);
  if (otherCats.length > 1) suggestions.push(`Browse ${otherCats[1]} options`);

  if (intent === 'buy') suggestions.push('Switch to renting instead');
  else suggestions.push('Switch to buying instead');

  return suggestions.slice(0, 4);
}

export class AgentOrchestrator {
  private sessions: Map<string, SessionState> = new Map();

  public getOrCreateSession(sessionId: string): SessionState {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        sessionId,
        phase: 'interview',
        preferences: {
          intent: null,
          useCase: null,
          category: null,
          budget: null,
          targetDate: null,
          mustHaves: [],
        },
        searchResults: [],
        recommendations: [],
        selectedListingId: null,
        application: null,
        paymentStatus: null,
      });
    }
    return this.sessions.get(sessionId)!;
  }

  public buildWelcomeMessage(): { text: string; suggestions: string[] } {
    return {
      text:
        `👋 Welcome to **AI Car Matchmaker** — your personal showroom concierge!\n\n` +
        `I search **378 real listings** across 12 categories to find your perfect vehicle.\n\n` +
        `🚗 **Categories I cover:**\n` +
        `Sedan • SUV • Compact/Hatchback • Truck/Pickup • Minivan • Coupe • Convertible • Electric • Hybrid • Luxury • Sports Car • Off-Road/4x4\n\n` +
        `💡 **Try saying:**\n` +
        `*"I want to buy a Sedan under $25k"* — I'll show only matching cars, never over budget.\n` +
        `*"Rent me a Luxury car this weekend"* — I'll find daily rates that fit.\n\n` +
        `What are you looking for today?`,
      suggestions: [
        'Buy a Sedan under $25k',
        'Show Electric cars under $45k',
        'Rent a Luxury car',
        'Show all SUV options',
      ],
    };
  }

  public async processUserMessage(
    sessionId: string,
    userText: string,
    onToken: (token: string) => void,
    onA2UI: (msgs: any[]) => void,
    onSuggestions: (chips: string[]) => void
  ): Promise<SessionState> {
    const session = this.getOrCreateSession(sessionId);
    const textLower = userText.toLowerCase().trim();

    // ─── Car selection — extract any car-XXX id from message ────────
    // Handles: "Select car car-133", "apply for car-133", "car-133", "book car car-133"
    const carIdMatch = userText.match(/\b(car-\d+)\b/i);
    const isSelectIntent = carIdMatch && (
      textLower.includes('select') || textLower.includes('apply') ||
      textLower.includes('book') || textLower.includes('choose') ||
      textLower.trim() === carIdMatch[1].toLowerCase()
    );
    if (carIdMatch && isSelectIntent) {
      const carId = carIdMatch[1].toLowerCase();
      session.selectedListingId = carId;
      const { a2uiMessages } = startApplication(session, carId);
      onA2UI(a2uiMessages);
      await this.stream(`✅ Application Form for **${carId.toUpperCase()}** is now open on your screen. Fill in your details to proceed!`, onToken);
      onSuggestions(['Submit application', 'Choose a different car', 'Go back to results']);
      return session;
    }

    // ─── "Show more" command ─────────────────────────────────────────
    if (textLower.includes('show more') || textLower.includes('more options') || textLower.includes('more results') || textLower.match(/expand/)) {
      const { results } = searchListings(session, {
        intent: session.preferences.intent || 'buy',
        category: session.preferences.category || undefined,
        ignorebudget: true,
      });
      const expanded = results.slice(0, 12);
      const recs = expanded.map((car, i) => ({ listingId: car.id, score: 90 - i, reasoning: `${car.color} ${car.year} ${car.brand} ${car.model} — ${car.location}` }));
      const { a2uiMessages: recA2UI } = showRecommendations(session, recs);
      onA2UI(recA2UI);
      await this.stream(`Showing **${expanded.length} expanded results** (budget filter lifted). Check the cards on the right!`, onToken);
      onSuggestions(generateSuggestions(session, null, null, expanded.length));
      return session;
    }

    // ─── 1. Extract intent ───────────────────────────────────────────
    let extractedIntent: 'buy' | 'rent' | null = null;
    if (textLower.includes('buy') || textLower.includes('purchase')) extractedIntent = 'buy';
    else if (textLower.includes('rent') || textLower.includes('lease')) extractedIntent = 'rent';

    // ─── 2. Extract category ─────────────────────────────────────────
    const catMap: Record<string, string> = {
      'sports car': 'Sports Car', 'sports': 'Sports Car',
      'off-road': 'Off-Road/4x4', '4x4': 'Off-Road/4x4',
      hatchback: 'Compact/Hatchback', compact: 'Compact/Hatchback',
      sedan: 'Sedan', suv: 'SUV', truck: 'Truck/Pickup', pickup: 'Truck/Pickup',
      coupe: 'Coupe', convertible: 'Convertible', electric: 'Electric', ev: 'Electric',
      hybrid: 'Hybrid', luxury: 'Luxury', minivan: 'Minivan', van: 'Minivan',
    };
    const catKeys = Object.keys(catMap).sort((a, b) => b.length - a.length);
    const foundCats = new Set<string>();
    for (const key of catKeys) {
      if (textLower.includes(key)) foundCats.add(catMap[key]);
    }
    const extractedCategory = foundCats.size > 0 ? Array.from(foundCats) : null;

    // ─── 3. Extract budget ────────────────────────────────────────────
    let extractedBudget: { min: number; max: number; currency: string } | null = null;
    const budgetPatterns = [
      { re: /\$(\d+(?:\.\d+)?)\s*k/i, mult: 1000 },
      { re: /(\d+(?:\.\d+)?)\s*k\b/i, mult: 1000 },
      { re: /(\d+)\s*thousand/i, mult: 1000 },
      { re: /\$(\d{4,6})/i, mult: 1 },
      { re: /(?:budget|under|max|below|less than)[^\d]*(\d{4,6})/i, mult: 1 },
    ];
    for (const { re, mult } of budgetPatterns) {
      const m = textLower.match(re);
      if (m?.[1]) {
        const val = parseFloat(m[1].replace(/,/g, '')) * mult;
        if (val >= 1000 && val <= 500000) {
          extractedBudget = { min: 0, max: Math.round(val), currency: 'USD' };
          break;
        }
      }
    }

    const isBudgetUpdate = extractedBudget !== null;
    const isCategoryUpdate = extractedCategory !== null;

    // ─── 4. Update preferences ────────────────────────────────────────
    const { updatedPrefs, a2uiMessages: prefA2UI } = updatePreferences(session, {
      intent: extractedIntent,
      useCase: textLower.includes('commute') ? 'daily commuting'
        : textLower.includes('family') ? 'family trips'
        : textLower.includes('road trip') ? 'road trips'
        : textLower.includes('weekend') ? 'weekend drives'
        : session.preferences.useCase,
      category: extractedCategory || session.preferences.category,
      budget: extractedBudget || session.preferences.budget,
    });
    onA2UI(prefA2UI);

    const isReadyToSearch =
      isBudgetUpdate || isCategoryUpdate ||
      textLower.includes('show') || textLower.includes('find') || textLower.includes('search') ||
      session.phase === 'recommending' ||
      (updatedPrefs.intent !== null && (updatedPrefs.category?.length || updatedPrefs.budget !== null));

    // ─── 5. Interview phase ───────────────────────────────────────────
    if (!isReadyToSearch && session.phase === 'interview') {
      let response = '';
      if (!updatedPrefs.intent) {
        response = `Are you looking to **buy** or **rent** a vehicle?\n\nI have listings across Sedan, SUV, Electric, Hybrid, Luxury, Sports Car, Truck/Pickup, Coupe, Convertible, Minivan, Compact, and Off-Road categories.`;
      } else if (!updatedPrefs.category?.length) {
        response = `Great — you want to **${updatedPrefs.intent}**!\n\nWhat category? Choose from:\nSedan • SUV • Electric • Hybrid • Luxury • Sports Car • Truck/Pickup • Coupe • Convertible • Minivan • Compact/Hatchback • Off-Road/4x4`;
      } else if (!updatedPrefs.budget) {
        response = `Nice! What's your **maximum budget** for a ${updatedPrefs.category.join('/')}? (e.g. $20k, $35,000, $50k)`;
      } else {
        response = `All set — searching for you now...`;
      }
      await this.stream(response, onToken);
      onSuggestions(generateSuggestions(session, null, null, 0));
      return session;
    }

    // ─── 6. Search — STRICT budget ────────────────────────────────────
    const { results, cheapestInCategory, cheapestPrice, totalInCategory } = searchListings(session, {
      intent: updatedPrefs.intent || 'buy',
      category: updatedPrefs.category || undefined,
      maxBudget: updatedPrefs.budget?.max,
    });

    // ─── 7. Handle zero results honestly ─────────────────────────────
    if (results.length === 0) {
      const catLabel = updatedPrefs.category?.join(' / ') || 'this category';
      const budgetLabel = updatedPrefs.budget?.max ? `$${updatedPrefs.budget.max.toLocaleString()}` : 'your budget';
      const intent = updatedPrefs.intent || 'buy';

      let noResultsMsg = `😔 I searched all **${totalInCategory} ${catLabel}** listings in our ${intent} inventory but found **none under ${budgetLabel}**.\n\n`;

      if (cheapestPrice !== null && cheapestInCategory) {
        const suggestedBudget = Math.ceil(cheapestPrice * 1.1 / 1000) * 1000;
        noResultsMsg +=
          `💡 **The closest option** starts at **$${cheapestPrice.toLocaleString()}** — a ${cheapestInCategory.year} ${cheapestInCategory.brand} ${cheapestInCategory.model} in ${cheapestInCategory.location}.\n\n` +
          `Would you like me to:\n` +
          `• Raise your budget to **$${suggestedBudget.toLocaleString()}** to see ${catLabel} options?\n` +
          `• Search a **different category** within ${budgetLabel}?\n` +
          `• Show you the **cheapest ${catLabel}** we have regardless of your budget?`;
      } else {
        noResultsMsg += `We may not have ${catLabel} listings in the ${intent} section yet. Try a different category or switch to renting.`;
      }

      // Clear the showroom floor (no cards to show)
      onA2UI([]);
      await this.stream(noResultsMsg, onToken);
      onSuggestions(generateSuggestions(session, cheapestInCategory, cheapestPrice, 0));
      return session;
    }

    // ─── 8. Show results (up to 8) ────────────────────────────────────
    const shown = results.slice(0, 8);
    const recs = shown.map((car, idx) => {
      let score = 99 - idx * 2;
      const priceStr = updatedPrefs.intent === 'rent'
        ? `$${car.dailyRate}/day`
        : `$${car.price?.toLocaleString()}`;
      const reasoning =
        `${car.color} ${car.fuelType} ${car.category} with ${car.features.slice(0, 2).join(' & ')}. ` +
        `${priceStr} · ${car.year} · ${car.condition} · ${car.location}.`;
      return { listingId: car.id, score, reasoning };
    });

    const { a2uiMessages: recA2UI } = showRecommendations(session, recs);
    onA2UI(recA2UI);

    // Build clean summary
    let prefix = '';
    if (isBudgetUpdate && updatedPrefs.budget) {
      prefix = `✅ Budget updated to **$${updatedPrefs.budget.max.toLocaleString()}**. `;
    }
    const catLabel = updatedPrefs.category?.join(' / ') || 'all categories';
    const budgetLabel = updatedPrefs.budget?.max ? `under **$${updatedPrefs.budget.max.toLocaleString()}**` : '';
    const moreAvailable = results.length > shown.length ? ` (${results.length - shown.length} more available — say *"show more"*)` : '';

    const summaryText =
      `${prefix}Found **${shown.length} ${catLabel}** listings ${budgetLabel}${moreAvailable}:\n\n` +
      shown.map((c, idx) => {
        const priceStr = updatedPrefs.intent === 'rent'
          ? `$${c.dailyRate}/day rental`
          : c.price ? `$${c.price.toLocaleString()}` : 'Contact for price';
        return `${idx + 1}. **${c.year} ${c.brand} ${c.model}** · ${c.color} · ${priceStr}\n   💡 ${recs[idx].reasoning}`;
      }).join('\n\n') +
      `\n\n👉 Interactive glass cards are updated on the right. Click **Apply / Book** to proceed.`;

    await this.stream(summaryText, onToken);
    onSuggestions(generateSuggestions(session, cheapestInCategory, cheapestPrice, shown.length));

    return session;
  }

  private async stream(text: string, onToken: (t: string) => void): Promise<void> {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      onToken(words[i] + (i < words.length - 1 ? ' ' : ''));
      await new Promise((r) => setTimeout(r, 9));
    }
  }

  public handleApplicationSubmit(sessionId: string, formData: Record<string, unknown>) {
    const session = this.getOrCreateSession(sessionId);
    session.application = formData;
    const { a2uiMessages } = startCheckout(session, `APP-${Date.now().toString().slice(-4)}`);
    return { session, a2uiMessages };
  }

  public handlePaymentSubmit(sessionId: string, _paymentData: Record<string, unknown>) {
    const session = this.getOrCreateSession(sessionId);
    session.paymentStatus = 'confirmed';
    session.phase = 'done';
    return { session, a2uiMessages: updateProgress(session, 'done', 'Confirmed!') };
  }
}
