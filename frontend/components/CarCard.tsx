'use client';

import React from 'react';
import { Fuel, MapPin, Gauge, ArrowUpRight } from 'lucide-react';

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

export interface CarCardProps {
  id: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  color?: string;
  category: string;
  listingType: 'rent' | 'buy' | 'both';
  price: number | null;
  dailyRate: number | null;
  mileage: number;
  fuelType: string;
  condition: string;
  location: string;
  marketplace: string;
  imageUrl: string;
  features: string[];
  matchScore: number;
  reasoning: string;
  onSelectCar?: (listingId: string) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  id,
  brand,
  model,
  trim,
  year,
  color,
  category,
  listingType,
  price,
  dailyRate,
  mileage,
  fuelType,
  condition,
  location,
  marketplace,
  imageUrl,
  features,
  matchScore,
  reasoning,
  onSelectCar,
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col relative group">
      {/* Match Score Ring Badge */}
      <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md border border-showroom-teal/40 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-teal-glow">
        <div className="w-2 h-2 rounded-full bg-showroom-teal animate-ping" />
        <span className="font-mono text-xs font-bold text-showroom-teal">
          {matchScore}% MATCH
        </span>
      </div>

      {/* Car Image */}
      <div className="relative h-48 w-full overflow-hidden bg-black/40">
        <img
          src={imageUrl}
          alt={`${brand} ${model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-showroom-bg via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 flex gap-2">
          <span className="bg-white/10 backdrop-blur-md border border-white/10 font-mono text-[10px] text-showroom-ink px-2 py-0.5 rounded-md uppercase">
            {category}
          </span>
          <span className="bg-showroom-amber/20 border border-showroom-amber/40 font-mono text-[10px] text-showroom-amber px-2 py-0.5 rounded-md uppercase">
            {condition}
          </span>
        </div>
      </div>

      {/* Spec Block */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h4 className="font-heading font-bold text-xl text-showroom-ink tracking-tight">
              {year} {brand} {model}
            </h4>
            <span className="font-mono text-sm text-gray-400">{trim}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400 mb-4">
            <MapPin className="w-3.5 h-3.5 text-showroom-teal" />
            <span>{location}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">{marketplace}</span>
          </div>

          {/* Pricing Banner */}
          <div className="glass-panel rounded-xl p-3 mb-4 flex items-center justify-between border border-white/5">
            <div>
              <span className="font-mono text-[10px] uppercase text-gray-400">Price / Rate</span>
              <div className="font-mono font-bold text-lg text-showroom-ink">
                {price ? `$${price.toLocaleString()}` : `$${dailyRate}/day`}
              </div>
            </div>
            {listingType === 'both' && dailyRate && price && (
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase text-showroom-teal">Or Rental</span>
                <div className="font-mono text-xs text-showroom-teal font-semibold">${dailyRate}/day</div>
              </div>
            )}
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-xs text-gray-300">
            <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg">
              <Gauge className="w-3.5 h-3.5 text-showroom-amber" />
              <span>{mileage.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg">
              <Fuel className="w-3.5 h-3.5 text-showroom-teal" />
              <span>{fuelType}</span>
            </div>
            {color && (
              <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg">
                <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ background: colorToHex(color) }} />
                <span className="truncate">{color}</span>
              </div>
            )}
          </div>

          {/* Italic Personalized Reasoning */}
          <div className="bg-showroom-teal/5 border border-showroom-teal/20 rounded-xl p-3 mb-4">
            <p className="font-sans italic text-xs text-showroom-teal/90 leading-relaxed">
              "{reasoning}"
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelectCar?.(id)}
          className="w-full bg-showroom-amber hover:bg-amber-400 text-black font-heading font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-amber-glow active:scale-[0.98]"
        >
          <span>Apply & Rent / Buy</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
