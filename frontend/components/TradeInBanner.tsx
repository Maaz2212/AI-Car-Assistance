'use client';

import React, { useState } from 'react';
import { DollarSign, Trash2, ChevronRight, PlusCircle, Car } from 'lucide-react';

interface TradeInBannerProps {
  tradeIn?: { year: number; brand: string; model: string; estimatedValue: number } | null;
  onTradeInSubmit: (query: string) => void;
  onClearTradeIn: () => void;
}

export const TradeInBanner: React.FC<TradeInBannerProps> = ({
  tradeIn,
  onTradeInSubmit,
  onClearTradeIn,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState('2019');
  const [makeModel, setMakeModel] = useState('Honda Civic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!makeModel.trim()) return;
    onTradeInSubmit(`I have a ${year} ${makeModel.trim()} to trade in`);
    setIsOpen(false);
  };

  if (tradeIn) {
    return (
      <div className="glass-panel rounded-2xl p-4 border border-showroom-amber/40 bg-gradient-to-r from-showroom-amber/10 via-black/40 to-transparent flex flex-wrap items-center justify-between gap-3 shadow-amber-glow animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-showroom-amber/20 border border-showroom-amber/40 flex items-center justify-center text-showroom-amber shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-showroom-ink">
                Trade-in Applied: {tradeIn.year} {tradeIn.brand} {tradeIn.model}
              </span>
              <span className="bg-showroom-amber text-black font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                Active Offset
              </span>
            </div>
            <p className="font-mono text-xs text-showroom-amber">
              Appraised Value: <strong>${tradeIn.estimatedValue.toLocaleString()}</strong> — subtracted from all vehicle prices below!
            </p>
          </div>
        </div>

        <button
          onClick={onClearTradeIn}
          className="flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Trade-in</span>
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-3 px-4 border border-white/10 bg-black/40 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Car className="w-4 h-4 text-showroom-amber" />
        <span className="font-mono text-xs text-gray-300">
          Have a vehicle to trade in? Estimate your trade-in credit instantly.
        </span>
      </div>

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 font-mono text-xs text-showroom-amber hover:text-amber-300 bg-showroom-amber/10 hover:bg-showroom-amber/20 border border-showroom-amber/30 px-3 py-1.5 rounded-xl transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Trade-in</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year (e.g. 2019)"
            className="w-24 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-showroom-ink font-mono focus:outline-none focus:border-showroom-amber"
          />
          <input
            type="text"
            value={makeModel}
            onChange={(e) => setMakeModel(e.target.value)}
            placeholder="Make & Model (e.g. Civic)"
            className="w-36 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-showroom-ink font-sans focus:outline-none focus:border-showroom-amber"
          />
          <button
            type="submit"
            className="bg-showroom-amber text-black font-semibold text-xs px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-amber-400 transition-all"
          >
            <span>Appraise</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-gray-400 hover:text-white px-2"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};
