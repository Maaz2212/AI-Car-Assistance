import fs from 'fs';
import path from 'path';
import { Listing, SessionState } from './types';
import { buildCatalogueMessages, buildProgressMessages } from './a2ui-templates';

const datasetPath = path.join(__dirname, '..', '..', 'data', 'listings.json');
let ALL_LISTINGS: Listing[] = [];

export function reloadDataset(): Listing[] {
  try {
    if (fs.existsSync(datasetPath)) {
      ALL_LISTINGS = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reloading dataset:', e);
  }
  return ALL_LISTINGS;
}
reloadDataset();

export function getAllListings(): Listing[] {
  return ALL_LISTINGS;
}

export function updatePreferences(
  session: SessionState,
  partialPrefs: Partial<any>
): { updatedPrefs: any; a2uiMessages: any[] } {
  const current = session.preferences;
  session.preferences = {
    intent: partialPrefs.intent !== undefined && partialPrefs.intent !== null ? partialPrefs.intent : current.intent,
    useCase: partialPrefs.useCase !== undefined && partialPrefs.useCase !== null ? partialPrefs.useCase : current.useCase,
    category: partialPrefs.category !== undefined && partialPrefs.category !== null ? partialPrefs.category : current.category,
    budget: partialPrefs.budget !== undefined && partialPrefs.budget !== null ? partialPrefs.budget : current.budget,
    targetDate: partialPrefs.targetDate !== undefined ? partialPrefs.targetDate : current.targetDate,
    mustHaves: partialPrefs.mustHaves ? Array.from(new Set([...current.mustHaves, ...partialPrefs.mustHaves])) : current.mustHaves,
  };

  const filledSlots = [
    session.preferences.intent && `Intent: ${session.preferences.intent}`,
    session.preferences.category?.length && `Category: ${session.preferences.category.join(', ')}`,
    session.preferences.budget && `Max: $${session.preferences.budget.max.toLocaleString()}`,
  ].filter(Boolean).join(' | ');

  return {
    updatedPrefs: session.preferences,
    a2uiMessages: buildProgressMessages('interview', filledSlots || 'Collecting preferences...'),
  };
}

/**
 * Core search — STRICT budget enforcement.
 * Returns { results, cheapestAvailable } where cheapestAvailable
 * is the min-price car in the category (regardless of budget) 
 * so the agent can give honest "raise budget to $X" suggestions.
 */
export function searchListings(
  session: SessionState,
  filters: {
    category?: string[];
    intent?: 'buy' | 'rent';
    maxBudget?: number;
    ignorebudget?: boolean;
  }
): { results: Listing[]; cheapestInCategory: Listing | null; cheapestPrice: number | null; totalInCategory: number } {
  reloadDataset();
  const intent = filters.intent || session.preferences.intent || 'buy';
  const maxBudget = filters.ignorebudget ? undefined : filters.maxBudget;
  const categories = filters.category;

  // Step 1: filter by intent type
  const intentMatched = ALL_LISTINGS.filter((car) => {
    if (intent === 'buy' && car.listingType === 'rent') return false;
    if (intent === 'rent' && car.listingType === 'buy') return false;
    return true;
  });

  // Step 2: filter by category (if provided)
  const categoryMatched = categories?.length
    ? intentMatched.filter((car) => categories.some((c) => c.toLowerCase() === car.category.toLowerCase()))
    : intentMatched;

  const totalInCategory = categoryMatched.length;

  // Find the cheapest option in category (ignore budget) for honest "raise budget to X" suggestion
  const sortedByPrice = [...categoryMatched].sort((a, b) => {
    const pa = intent === 'rent' ? (a.dailyRate ?? 999999) : (a.price ?? 999999);
    const pb = intent === 'rent' ? (b.dailyRate ?? 999999) : (b.price ?? 999999);
    return pa - pb;
  });
  const cheapestInCategory = sortedByPrice[0] || null;
  const cheapestPrice = cheapestInCategory
    ? (intent === 'rent' ? cheapestInCategory.dailyRate : cheapestInCategory.price)
    : null;

  // Step 3: STRICT budget filter — never show over budget
  let budgetMatched = categoryMatched;
  if (maxBudget !== undefined && maxBudget > 0) {
    budgetMatched = categoryMatched.filter((car) => {
      if (intent === 'rent' && car.dailyRate !== null) return car.dailyRate <= maxBudget;
      if (car.price !== null) return car.price <= maxBudget;
      return false; // unknown price — skip
    });
  }

  // Sort by price ascending (best value first)
  budgetMatched.sort((a, b) => {
    const pa = intent === 'rent' ? (a.dailyRate ?? 999999) : (a.price ?? 999999);
    const pb = intent === 'rent' ? (b.dailyRate ?? 999999) : (b.price ?? 999999);
    return pa - pb;
  });

  session.searchResults = budgetMatched;
  return { results: budgetMatched, cheapestInCategory, cheapestPrice, totalInCategory };
}

export function estimateTradeIn(year: number, brand: string, model: string): number {
  const currentYear = 2026;
  const age = Math.max(0, currentYear - year);
  let baseValue = 18000;
  const b = brand.toLowerCase();
  const m = model.toLowerCase();

  if (b.includes('bmw') || b.includes('mercedes') || b.includes('audi') || b.includes('lexus') || b.includes('porsche')) {
    baseValue = 28000;
  } else if (m.includes('f-150') || m.includes('silverado') || m.includes('tacoma') || m.includes('tahoe')) {
    baseValue = 25000;
  } else if (m.includes('rav4') || m.includes('cr-v') || m.includes('cx-5') || m.includes('forester') || m.includes('outback')) {
    baseValue = 20000;
  } else if (m.includes('civic') || m.includes('corolla') || m.includes('elantra') || m.includes('sentra') || m.includes('fit')) {
    baseValue = 15000;
  }

  let value = baseValue * Math.pow(0.91, age);
  return Math.max(2500, Math.min(45000, Math.round(value / 250) * 250));
}

export function showRecommendations(
  session: SessionState,
  recommendations: Array<{ listingId: string; score: number; reasoning: string }>
): { a2uiMessages: any[] } {
  session.phase = 'recommending';
  session.recommendations = recommendations;

  const rankedItems = recommendations
    .map((rec) => {
      const listing = ALL_LISTINGS.find((c) => c.id === rec.listingId)
        || session.searchResults.find((c) => c.id === rec.listingId);
      if (!listing) return null;
      return { listing, score: rec.score, reasoning: rec.reasoning };
    })
    .filter((item): item is { listing: Listing; score: number; reasoning: string } => item !== null);

  return { a2uiMessages: buildCatalogueMessages(rankedItems, session.tradeIn) };
}

export function updateProgress(session: SessionState, phase: any, statusText: string) {
  session.phase = phase;
  return buildProgressMessages(phase, statusText);
}

export function startApplication(session: SessionState, listingId: string) {
  session.phase = 'form';
  session.selectedListingId = listingId;
  return { listingId, a2uiMessages: buildProgressMessages('form', `Application opened for ${listingId}`) };
}

export function startCheckout(session: SessionState, applicationId: string) {
  session.phase = 'payment';
  return { applicationId, a2uiMessages: buildProgressMessages('payment', `Checkout for ${applicationId}`) };
}
