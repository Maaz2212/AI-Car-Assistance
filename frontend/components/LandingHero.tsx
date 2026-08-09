'use client';

import React from 'react';
import { Spline3DCarViewer } from './Spline3DCarViewer';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Car, TrendingUp, Flame } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
  onSelectVehicle?: (modelName: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted, onSelectVehicle }) => {
  const scrollToTrending = () => {
    const el = document.getElementById('trending-fleet');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex flex-col gap-8 pt-4 pb-8">
      {/* Top Banner Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2">
        <div className="flex items-center gap-2 text-xs font-mono text-showroom-teal">
          <TrendingUp className="w-4 h-4 text-showroom-teal animate-bounce" />
          <span className="font-bold tracking-wide uppercase text-white">TRENDING IN MARKET</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-300">EV Supercars & Luxury SUV Demand +28%</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-showroom-amber" />
            <span>AI Match Precision: <strong className="text-white">98.6%</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-showroom-teal" />
            <span>Verified Market Data</span>
          </div>
        </div>
      </div>

      {/* Main Hero Header Title & Copy */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pt-2">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-showroom-amber/20 to-showroom-teal/20 border border-showroom-amber/40 shadow-amber-glow">
            <Flame className="w-4 h-4 text-showroom-amber animate-pulse" />
            <span className="font-mono text-xs font-bold text-showroom-ink uppercase tracking-wider">
              NEXT-GEN VEHICLE MATCHMAKING ENGINE
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-[1.1]">
            Match Your Ideal Drive with <br />
            <span className="bg-gradient-to-r from-showroom-teal via-white to-showroom-amber bg-clip-text text-transparent">
              Hyper-Personalized AI Intelligence.
            </span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
            Welcome to <strong className="text-white">Carमैच</strong> (CarMatch). Discover curated luxury vehicles, calculate real-time trade-in valuations, compare specs head-to-head, and complete instant checkout—powered by adaptive conversational AI.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto">
          <button
            onClick={onGetStarted}
            className="group relative bg-gradient-to-r from-showroom-amber to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-heading font-extrabold text-base px-7 py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-amber-glow transition-all active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-black group-hover:rotate-12 transition-transform" />
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={scrollToTrending}
            className="glass-panel glass-panel-hover text-white font-mono text-sm px-6 py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/20 hover:border-showroom-teal/50 transition-all active:scale-95"
          >
            <Car className="w-4 h-4 text-showroom-teal" />
            <span>Explore Fleet</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D WebGL Spline Supercar Viewport */}
      <Spline3DCarViewer onSelectVehicle={onSelectVehicle} />
    </section>
  );
};
