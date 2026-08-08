export type Phase = 'interview' | 'researching' | 'recommending' | 'form' | 'payment' | 'done';

export interface Preferences {
  intent: 'buy' | 'rent' | null;
  useCase: string | null;
  category: string[] | null;
  budget: { min: number; max: number; currency: string } | null;
  targetDate: string | null;
  mustHaves: string[];
}

export interface Listing {
  id: string;
  category: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  color: string;
  listingType: 'rent' | 'buy' | 'both';
  price: number | null;
  dailyRate: number | null;
  mileage: number;
  condition: 'new' | 'used';
  fuelType: string;
  seats: number;
  location: string;
  availabilityDate: string;
  marketplace: string;
  features: string[];
  imageUrl: string;
}

export interface Recommendation {
  listingId: string;
  score: number; // 0 - 100 match score
  reasoning: string;
}

export interface SessionState {
  sessionId: string;
  phase: Phase;
  preferences: Preferences;
  searchResults: Listing[];
  recommendations: Recommendation[];
  selectedListingId: string | null;
  application: Record<string, unknown> | null;
  paymentStatus: 'pending' | 'confirmed' | null;
}

export interface WSMessage {
  type:
    | 'chat_token'
    | 'chat_end'
    | 'a2ui_messages'
    | 'session_state'
    | 'mcp_tool_call'
    | 'mcp_tool_result'
    | 'error';
  sessionId?: string;
  token?: string;
  messages?: any[];
  state?: SessionState;
  toolName?: string;
  args?: any;
  callId?: string;
  result?: any;
  suggestions?: string[];
  error?: string;
}
