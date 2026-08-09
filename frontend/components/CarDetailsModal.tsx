'use client';

import React from 'react';
import { X, Check, MapPin, Gauge, Fuel, Sparkles, ShieldCheck, ArrowUpRight, DollarSign } from 'lucide-react';

const COLOR_MAP: Record<string, string> = {
  'Midnight Black': '#1a1a1a', 'Pearl White': '#f5f5f0', 'Silver Metallic': '#a8a9ad',
  'Deep Red': '#8b1a1a', 'Navy Blue': '#001f5b', 'Forest Green': '#228b22',
  'Champagne Gold': '#c9a84c', 'Slate Grey': '#708090', 'Burnt Orange': '#cc5500',
  'Sapphire Blue': '#0f52ba', 'Arctic White': '#f0f4f8', 'Matte Black': '#28282b',
  'Racing Red': '#cc0000', 'Sky Blue': '#87ceeb', 'Olive Green': '#6b7c3b',
};

function colorToHex(name: string): string {
  return COLOR_MAP[name] || '#555';
}

export interface CarDetailsModalProps {
  car: {
    id: string;
    brand: string;
    model: string;
    trim: string;
    year: number;
    color?: string;
    category: string;
    listingType: 'rent' | 'buy' | 'both';
    price: number | null;
    netPrice?: number | null;
    tradeInOffset?: number | null;
    dailyRate: number | null;
    mileage: number;
    fuelType: string;
    condition: string;
    location: string;
    marketplace: string;
    imageUrl: string;
    features: string[];
    matchScore?: number;
    reasoning?: string;
  };
  onClose: () => void;
  onSelectCar?: (listingId: string) => void;
}

export const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ car, onClose, onSelectCar }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl overflow-hidden border border-white/15 shadow-2xl my-auto">
        {/* Header Bar with Prominent Close (X) Button */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-showroom-teal/20 border border-showroom-teal/40 flex items-center justify-center text-showroom-teal font-mono font-bold">
              ID
            </div>
            <div>
              <div className="font-mono text-xs text-showroom-teal uppercase tracking-wider">
                Full Specification Detail • {car.id.toUpperCase()}
              </div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                {car.year} {car.brand} {car.model}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/15 flex items-center justify-center transition-all active:scale-95 shadow-lg"
            title="Close Specifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Main Hero Image */}
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-black border border-white/10">
            <img
              src={car.imageUrl}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-showroom-bg via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-black/70 backdrop-blur-md border border-white/20 font-mono text-xs text-white px-3 py-1 rounded-full uppercase">
                {car.category}
              </span>
              <span className="bg-showroom-amber/20 backdrop-blur-md border border-showroom-amber/40 font-mono text-xs text-showroom-amber px-3 py-1 rounded-full uppercase font-bold">
                {car.condition}
              </span>
            </div>

            {car.matchScore && (
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-showroom-teal/50 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-teal-glow">
                <div className="w-2 h-2 rounded-full bg-showroom-teal animate-ping" />
                <span className="font-mono text-xs font-bold text-showroom-teal">
                  {car.matchScore}% MATCH SCORE
                </span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-xs text-gray-300">
              <MapPin className="w-4 h-4 text-showroom-teal" />
              <span>{car.location}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{car.marketplace}</span>
            </div>
          </div>

          {/* Pricing & Trade-In Offset Summary */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-gray-400 uppercase">
                {car.netPrice !== null && car.netPrice !== undefined ? 'Net Valuation (After Trade-in)' : 'List Valuation / Rate'}
              </div>
              {car.netPrice !== null && car.netPrice !== undefined && car.price ? (
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-heading font-extrabold text-3xl text-showroom-amber">
                    ${car.netPrice.toLocaleString()}
                  </span>
                  <span className="font-mono text-sm text-gray-400 line-through">
                    ${car.price.toLocaleString()}
                  </span>
                  <span className="bg-showroom-amber/20 text-showroom-amber font-mono text-xs px-2.5 py-0.5 rounded-full border border-showroom-amber/30">
                    Trade-In Offset Active
                  </span>
                </div>
              ) : (
                <div className="font-heading font-extrabold text-3xl text-white mt-1">
                  {car.price ? `$${car.price.toLocaleString()}` : car.dailyRate ? `$${car.dailyRate}/day` : 'Contact for quote'}
                </div>
              )}
            </div>

            {car.listingType && (
              <div className="font-mono text-xs text-gray-400 bg-black/40 p-2.5 px-4 rounded-xl border border-white/10">
                Type: <strong className="text-showroom-teal uppercase">{car.listingType}</strong>
              </div>
            )}
          </div>

          {/* Technical Telemetry Specs */}
          <div>
            <h4 className="font-mono text-xs font-bold text-showroom-teal uppercase tracking-wider mb-3">
              Technical Telemetry Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="text-gray-400 text-[10px] uppercase">Odometer (Driven)</div>
                <div className="text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                  <Gauge className="w-4 h-4 text-showroom-amber" />
                  <span>{car.mileage.toLocaleString()} mi</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="text-gray-400 text-[10px] uppercase">Powertrain</div>
                <div className="text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                  <Fuel className="w-4 h-4 text-showroom-teal" />
                  <span>{car.fuelType}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="text-gray-400 text-[10px] uppercase">Exterior Color</div>
                <div className="text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                  {car.color && (
                    <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ background: colorToHex(car.color) }} />
                  )}
                  <span>{car.color || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="text-gray-400 text-[10px] uppercase">Trim Level</div>
                <div className="text-white font-bold text-sm truncate mt-0.5">
                  {car.trim || 'Base'}
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          {car.features && car.features.length > 0 && (
            <div>
              <h4 className="font-mono text-xs font-bold text-showroom-amber uppercase tracking-wider mb-3">
                Installed Equipment & Safety Features ({car.features.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {car.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl font-sans text-xs text-gray-200">
                    <Check className="w-4 h-4 text-showroom-teal shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Match Reasoning (If present) */}
          {car.reasoning && (
            <div className="bg-showroom-teal/10 border border-showroom-teal/30 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-mono text-xs text-showroom-teal font-bold">
                <Sparkles className="w-4 h-4 text-showroom-amber" />
                <span>AI Recommendation Rationale</span>
              </div>
              <p className="font-sans text-xs italic text-gray-300 leading-relaxed">
                "{car.reasoning}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 px-6 border-t border-white/10 bg-black/60 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-mono text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            Close Specifications
          </button>

          {onSelectCar && (
            <button
              onClick={() => {
                onClose();
                onSelectCar(car.id);
              }}
              className="bg-showroom-amber hover:bg-amber-400 text-black font-heading font-extrabold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-amber-glow transition-all active:scale-95"
            >
              <span>Apply for this Vehicle</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
