'use client';

import React from 'react';
import { Bot, Scale, ShieldCheck, CreditCard, Sparkles, Cpu } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Bot,
      title: 'Adaptive AI Conversational Engine',
      description: 'Interact with our real-time AI assistant to define preferences, budget, driving range, and lifestyle requirements in natural language.',
      glowColor: 'hover:border-showroom-teal/50 hover:shadow-teal-glow',
      iconColor: 'text-showroom-teal',
      tag: 'LLM Powered',
    },
    {
      icon: Sparkles,
      title: 'Real-Time Trade-In Valuation',
      description: 'Upload your current vehicle make, year, and mileage to get an instant appraisal credit subtracted directly from net vehicle pricing.',
      glowColor: 'hover:border-showroom-amber/50 hover:shadow-amber-glow',
      iconColor: 'text-showroom-amber',
      tag: 'Instant Appraisal',
    },
    {
      icon: Scale,
      title: 'Side-by-Side Spec Comparison',
      description: 'Select any 2 vehicles to evaluate side-by-side performance metrics, daily rental rates, fuel efficiency, and AI match reasoning.',
      glowColor: 'hover:border-white/40 hover:shadow-2xl',
      iconColor: 'text-white',
      tag: 'Dual Matrix',
    },
    {
      icon: CreditCard,
      title: 'McpApp Sandboxed Checkout',
      description: 'Complete multi-stage credit applications and checkout directly inside an isolated, secure sandbox surface.',
      glowColor: 'hover:border-showroom-teal/50 hover:shadow-teal-glow',
      iconColor: 'text-showroom-teal',
      tag: 'A2UI Surface',
    },
  ];

  return (
    <section className="py-8 space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-showroom-teal">
          <Cpu className="w-3.5 h-3.5" />
          <span>INTELLIGENT SHOWROOM PLATFORM</span>
        </div>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Engineered for Modern Car Buyers
        </h2>
        <p className="font-sans text-sm text-gray-400">
          Everything you need to discover, compare, valuate trade-ins, and purchase your next vehicle in one seamless workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-6 rounded-3xl border border-white/10 transition-all duration-300 ${feat.glowColor} flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${feat.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full border border-white/10">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-white">
                  {feat.title}
                </h3>

                <p className="font-sans text-xs text-gray-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-gray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-showroom-teal" />
                <span>Verified System Feature</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
