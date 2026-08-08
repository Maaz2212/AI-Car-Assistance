'use client';

import React from 'react';
import { X, Check, ArrowRight, Gauge, Fuel, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

interface CompareModalProps {
  cars: any[];
  tradeIn?: { estimatedValue: number } | null;
  onClose: () => void;
  onSelectCar: (carId: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  cars,
  tradeIn,
  onClose,
  onSelectCar,
}) => {
  if (cars.length < 2) return null;

  const [carA, carB] = cars;

  const getNetPrice = (car: any) => {
    if (!car.price) return null;
    if (car.netPrice !== undefined && car.netPrice !== null) return car.netPrice;
    if (tradeIn) return Math.max(0, car.price - tradeIn.estimatedValue);
    return car.price;
  };

  const netPriceA = getNetPrice(carA);
  const netPriceB = getNetPrice(carB);

  // Features sets for difference highlighting
  const featuresA = new Set(carA.features || []);
  const featuresB = new Set(carB.features || []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10 flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-showroom-amber/20 border border-showroom-amber/40 flex items-center justify-center text-showroom-amber">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-showroom-ink">
                Side-by-Side Comparison
              </h3>
              <p className="font-mono text-xs text-gray-400">
                Comparing {carA.year} {carA.brand} {carA.model} vs {carB.year} {carB.brand} {carB.model}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Top Vehicle Header Cards */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[carA, carB].map((car, idx) => {
              const netP = idx === 0 ? netPriceA : netPriceB;
              return (
                <div
                  key={car.id}
                  className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col justify-between relative group"
                >
                  <div className="h-32 rounded-lg overflow-hidden mb-3 bg-black/40 relative">
                    <img
                      src={car.imageUrl}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md border border-showroom-teal/40 font-mono text-[10px] font-bold text-showroom-teal px-2 py-0.5 rounded-full">
                      {car.matchScore}% MATCH
                    </div>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-lg text-showroom-ink">
                      {car.year} {car.brand} {car.model}
                    </h4>
                    <p className="font-mono text-xs text-gray-400 mb-3">{car.trim} • {car.color}</p>

                    <div className="bg-white/5 rounded-lg p-2.5 mb-3">
                      <span className="font-mono text-[10px] uppercase text-gray-400 block">
                        {netP !== null && tradeIn ? 'Net Price (After Trade-in)' : 'Price / Daily Rate'}
                      </span>
                      <div className="font-mono font-bold text-base text-showroom-amber">
                        {netP !== null && tradeIn ? (
                          <div className="flex items-baseline gap-2">
                            <span>${netP.toLocaleString()}</span>
                            {car.price && (
                              <span className="text-xs text-gray-400 line-through font-normal">
                                ${car.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span>{car.price ? `$${car.price.toLocaleString()}` : `$${car.dailyRate}/day`}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectCar(car.id);
                      onClose();
                    }}
                    className="w-full bg-showroom-amber hover:bg-amber-400 text-black font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-amber-glow"
                  >
                    <span>Apply for this Vehicle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Specs Comparison Table */}
          <div className="glass-panel rounded-xl overflow-hidden border border-white/5 font-sans text-xs">
            <div className="bg-white/5 p-3 font-mono text-xs font-semibold text-showroom-amber uppercase tracking-wider border-b border-white/5">
              Specifications Breakdown
            </div>

            <div className="divide-y divide-white/5">
              {/* Category */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-mono text-gray-400">Category</span>
                <span className="text-showroom-ink font-medium">{carA.category}</span>
                <span className="text-showroom-ink font-medium">{carB.category}</span>
              </div>

              {/* Condition */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-mono text-gray-400">Condition</span>
                <span className="text-showroom-ink capitalize">{carA.condition}</span>
                <span className="text-showroom-ink capitalize">{carB.condition}</span>
              </div>

              {/* Mileage */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-mono text-gray-400">Mileage</span>
                <span className="font-mono text-showroom-ink">{carA.mileage.toLocaleString()} mi</span>
                <span className="font-mono text-showroom-ink">{carB.mileage.toLocaleString()} mi</span>
              </div>

              {/* Fuel Type */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-mono text-gray-400">Fuel Type</span>
                <span className="text-showroom-teal font-medium">{carA.fuelType}</span>
                <span className="text-showroom-teal font-medium">{carB.fuelType}</span>
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-mono text-gray-400">Location</span>
                <span className="text-showroom-ink">{carA.location}</span>
                <span className="text-showroom-ink">{carB.location}</span>
              </div>

              {/* Marketplace */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-mono text-gray-400">Seller / Dealer</span>
                <span className="text-gray-300">{carA.marketplace}</span>
                <span className="text-gray-300">{carB.marketplace}</span>
              </div>
            </div>
          </div>

          {/* Key Features Comparison */}
          <div className="glass-panel rounded-xl p-4 border border-white/5">
            <h5 className="font-mono text-xs font-semibold text-showroom-amber uppercase mb-3">
              Included Features Comparison
            </h5>

            <div className="grid grid-cols-2 gap-4">
              {/* Car A Features */}
              <div>
                <span className="font-mono text-[11px] text-gray-400 block mb-2">{carA.brand} {carA.model}:</span>
                <div className="space-y-1.5">
                  {(carA.features || []).map((feat: string) => {
                    const isUnique = !featuresB.has(feat);
                    return (
                      <div
                        key={feat}
                        className={`flex items-center gap-1.5 text-xs p-1.5 rounded-lg border ${
                          isUnique
                            ? 'bg-showroom-amber/10 border-showroom-amber/30 text-showroom-amber'
                            : 'bg-white/5 border-white/5 text-gray-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{feat}</span>
                        {isUnique && <span className="ml-auto font-mono text-[9px] uppercase opacity-80">(Unique)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Car B Features */}
              <div>
                <span className="font-mono text-[11px] text-gray-400 block mb-2">{carB.brand} {carB.model}:</span>
                <div className="space-y-1.5">
                  {(carB.features || []).map((feat: string) => {
                    const isUnique = !featuresA.has(feat);
                    return (
                      <div
                        key={feat}
                        className={`flex items-center gap-1.5 text-xs p-1.5 rounded-lg border ${
                          isUnique
                            ? 'bg-showroom-teal/10 border-showroom-teal/30 text-showroom-teal'
                            : 'bg-white/5 border-white/5 text-gray-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{feat}</span>
                        {isUnique && <span className="ml-auto font-mono text-[9px] uppercase opacity-80">(Unique)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-20">
          <span className="font-mono text-xs text-gray-400">
            Select a vehicle above to open the application form.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-showroom-ink font-mono text-xs rounded-xl transition-all"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
