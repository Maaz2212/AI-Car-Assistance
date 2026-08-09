'use client';

import React from 'react';
import { Gauge, Zap, Eye, Car, ArrowUpRight } from 'lucide-react';

export interface ShowroomVehicle {
  id: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  category: string;
  listingType: 'rent' | 'buy' | 'both';
  price: number;
  dailyRate: number;
  mileage: number;
  fuelType: string;
  condition: string;
  location: string;
  marketplace: string;
  imageUrl: string;
  features: string[];
  description: string;
}

const SHOWROOM_FLEET: ShowroomVehicle[] = [
  {
    id: 'car-etron-gt',
    brand: 'Audi',
    model: 'e-tron GT RS',
    trim: 'RS Quattro Electric',
    year: 2025,
    category: 'Electric',
    listingType: 'both',
    price: 104900,
    dailyRate: 249,
    mileage: 1200,
    fuelType: 'Electric',
    condition: 'Like New',
    location: 'Los Angeles, CA',
    marketplace: 'Verified Premier Fleet',
    imageUrl: '/images/audi_etron_underglow.png',
    features: ['Matrix LED Headlights', 'Cyan Underglow Laser Beam', 'Adaptive Air Suspension', 'Bang & Olufsen 3D Sound', 'All-Wheel Steering'],
    description: 'Dark studio metallic exterior with warm gold roofline illumination and vibrant cyan neon underglow reflecting off wet floor reflections.',
  },
  {
    id: 'car-cayenne-gt',
    brand: 'Porsche',
    model: 'Cayenne Turbo GT',
    trim: 'V8 Twin-Turbo',
    year: 2024,
    category: 'SUV',
    listingType: 'buy',
    price: 98500,
    dailyRate: 280,
    mileage: 4500,
    fuelType: 'Gasoline',
    condition: 'Excellent',
    location: 'Miami, FL',
    marketplace: 'Luxury Exchange',
    imageUrl: '/images/porsche_suv_dark.png',
    features: ['Titanium Sport Exhaust', 'Carbon Ceramic Brakes', 'Alcantara Sport Seats', 'Teal Glowing Rim Accents', 'Active Aerodynamic Spoiler'],
    description: 'Sleek dark studio silhouette profile with warm ambient gold roofline highlights and neon teal glowing alloy wheels.',
  },
  {
    id: 'car-bmw-i7',
    brand: 'BMW',
    model: 'i7 xDrive60',
    trim: 'Executive Lounge M Sport',
    year: 2025,
    category: 'Luxury',
    listingType: 'both',
    price: 119300,
    dailyRate: 310,
    mileage: 800,
    fuelType: 'Electric',
    condition: 'Brand New',
    location: 'New York, NY',
    marketplace: 'Premier Showroom',
    imageUrl: '/images/car_headlight_macro.png',
    features: ['31-inch 8K Theater Screen', 'Adaptive Matrix LED Headlights', 'Executive Lounge Seating', 'Bowers & Wilkins Diamond Sound', 'Sky Lounge Panoramic Roof'],
    description: 'Close-up macro detail of matrix LED headlights and honeycomb front grille, wet surface rain droplets with warm yellow/cyan lighting refractions.',
  },
];

interface TrendingFleetProps {
  onViewDetails: (vehicle: any) => void;
  onSelectCar?: (listingId: string) => void;
}

export const TrendingFleet: React.FC<TrendingFleetProps> = ({ onViewDetails, onSelectCar }) => {
  return (
    <section id="trending-fleet" className="py-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-showroom-teal font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Car className="w-4 h-4 text-showroom-amber" />
            <span>EXECUTIVE FLEET EXHIBIT</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Our Showroom
          </h2>
        </div>

        <p className="font-mono text-xs text-gray-400 max-w-md">
          Explore curated vehicles from our premier floor. Click any vehicle to inspect full specifications or apply for instant reservation.
        </p>
      </div>

      {/* Showroom Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SHOWROOM_FLEET.map((vehicle) => (
          <div
            key={vehicle.id}
            className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col group border border-white/10 relative"
          >
            {/* Top Category Badge */}
            <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="font-mono text-xs text-white uppercase">{vehicle.category}</span>
            </div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-md border border-showroom-amber/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-amber-glow">
              <span className="font-mono text-xs font-bold text-showroom-amber">${vehicle.price.toLocaleString()}</span>
            </div>

            {/* Vehicle Image */}
            <div className="relative h-64 w-full overflow-hidden bg-black">
              <img
                src={vehicle.imageUrl}
                alt={vehicle.model}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-showroom-bg via-transparent to-transparent" />
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="font-mono text-xs text-showroom-teal font-semibold mb-1">
                  {vehicle.year} • {vehicle.trim}
                </div>
                <h3 className="font-heading font-extrabold text-xl text-white group-hover:text-showroom-amber transition-colors">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="font-sans text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {vehicle.description}
                </p>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 font-mono text-xs text-gray-300">
                <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-showroom-amber" />
                  <div>
                    <div className="text-[10px] text-gray-500">Odometer (Driven)</div>
                    <div className="text-white font-bold">{vehicle.mileage.toLocaleString()} mi</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-showroom-teal" />
                  <div>
                    <div className="text-[10px] text-gray-500">Powertrain</div>
                    <div className="text-white font-bold">{vehicle.fuelType}</div>
                  </div>
                </div>
              </div>

              {/* Dual Action Buttons: Full Specs & Apply */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => onViewDetails(vehicle)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-showroom-teal" />
                  <span>Full Specs</span>
                </button>

                <button
                  onClick={() => onSelectCar?.(vehicle.id)}
                  className="w-full bg-showroom-amber hover:bg-amber-400 text-black font-heading font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-amber-glow active:scale-95"
                >
                  <span>Apply</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
