import fs from 'fs';
import path from 'path';
import { Listing, SessionState } from './types';
import { buildCatalogueMessages, buildProgressMessages } from './a2ui-templates';

const SHOWROOM_ITEMS: Listing[] = [
  {
    id: 'car-etron-gt',
    brand: 'Audi',
    model: 'e-tron GT RS',
    trim: 'RS Quattro Electric',
    year: 2025,
    color: 'Slate Grey',
    category: 'Electric',
    listingType: 'both',
    price: 104900,
    dailyRate: 249,
    mileage: 1200,
    condition: 'new',
    fuelType: 'Electric',
    seats: 4,
    location: 'Los Angeles, CA',
    availabilityDate: '2026-08-10',
    marketplace: 'Verified Premier Fleet',
    features: ['Matrix LED Headlights', 'Cyan Underglow Laser Beam', 'Adaptive Air Suspension', 'Bang & Olufsen 3D Sound', 'All-Wheel Steering'],
    imageUrl: '/images/audi_etron_underglow.png',
  },
  {
    id: 'car-cayenne-gt',
    brand: 'Porsche',
    model: 'Cayenne Turbo GT',
    trim: 'V8 Twin-Turbo',
    year: 2024,
    color: 'Matte Black',
    category: 'SUV',
    listingType: 'buy',
    price: 98500,
    dailyRate: 280,
    mileage: 4500,
    condition: 'used',
    fuelType: 'Gasoline',
    seats: 5,
    location: 'Miami, FL',
    availabilityDate: '2026-08-10',
    marketplace: 'Luxury Exchange',
    features: ['Titanium Sport Exhaust', 'Carbon Ceramic Brakes', 'Alcantara Sport Seats', 'Teal Glowing Rim Accents', 'Active Aerodynamic Spoiler'],
    imageUrl: '/images/porsche_suv_dark.png',
  },
  {
    id: 'car-bmw-i7',
    brand: 'BMW',
    model: 'i7 xDrive60',
    trim: 'Executive Lounge M Sport',
    year: 2025,
    color: 'Sapphire Blue',
    category: 'Luxury',
    listingType: 'both',
    price: 119300,
    dailyRate: 310,
    mileage: 800,
    condition: 'new',
    fuelType: 'Electric',
    seats: 5,
    location: 'New York, NY',
    availabilityDate: '2026-08-10',
    marketplace: 'Premier Showroom',
    features: ['31-inch 8K Theater Screen', 'Adaptive Matrix LED Headlights', 'Executive Lounge Seating', 'Bowers & Wilkins Diamond Sound', 'Sky Lounge Panoramic Roof'],
    imageUrl: '/images/car_headlight_macro.png',
  },
];

const datasetPath = path.join(__dirname, '..', '..', 'data', 'listings.json');
let ALL_LISTINGS: Listing[] = [];

export function reloadDataset(): Listing[] {
  try {
    if (fs.existsSync(datasetPath)) {
      const raw = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      const existingIds = new Set(raw.map((item: Listing) => item.id));
      const newItems = SHOWROOM_ITEMS.filter((item) => !existingIds.has(item.id));
      ALL_LISTINGS = [...newItems, ...raw];
    } else {
      ALL_LISTINGS = SHOWROOM_ITEMS;
    }
  } catch (e) {
    console.error('Error reloading dataset:', e);
    ALL_LISTINGS = SHOWROOM_ITEMS;
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

  const intentMatched = ALL_LISTINGS.filter((car) => {
    if (intent === 'buy' && car.listingType === 'rent') return false;
    if (intent === 'rent' && car.listingType === 'buy') return false;
    return true;
  });

  const categoryMatched = categories?.length
    ? intentMatched.filter((car) => categories.some((c) => c.toLowerCase() === car.category.toLowerCase()))
    : intentMatched;

  const totalInCategory = categoryMatched.length;

  const sortedByPrice = [...categoryMatched].sort((a, b) => {
    const pa = intent === 'rent' ? (a.dailyRate ?? 999999) : (a.price ?? 999999);
    const pb = intent === 'rent' ? (b.dailyRate ?? 999999) : (b.price ?? 999999);
    return pa - pb;
  });
  const cheapestInCategory = sortedByPrice[0] || null;
  const cheapestPrice = cheapestInCategory
    ? (intent === 'rent' ? cheapestInCategory.dailyRate : cheapestInCategory.price)
    : null;

  let budgetMatched = categoryMatched;
  if (maxBudget !== undefined && maxBudget > 0) {
    budgetMatched = categoryMatched.filter((car) => {
      if (intent === 'rent' && car.dailyRate !== null) return car.dailyRate <= maxBudget;
      if (car.price !== null) return car.price <= maxBudget;
      return false;
    });
  }

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
