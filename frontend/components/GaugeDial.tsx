'use client';

import React from 'react';
import { CheckCircle2, Compass, Sparkles, FileText, CreditCard, Check } from 'lucide-react';

interface Stage {
  id: string;
  label: string;
}

interface GaugeDialProps {
  currentStage: string;
  stageIndex: number;
  statusText: string;
  stages: Stage[];
}

export const GaugeDial: React.FC<GaugeDialProps> = ({ currentStage, stageIndex, statusText, stages }) => {
  const activeIdx = Math.max(0, Math.min(stageIndex, stages.length - 1));
  const fillPercentage = ((activeIdx + 1) / stages.length) * 100;

  const stageIcons: Record<string, React.ReactNode> = {
    interview: <Compass className="w-4 h-4" />,
    researching: <Sparkles className="w-4 h-4" />,
    recommending: <CheckCircle2 className="w-4 h-4" />,
    form: <FileText className="w-4 h-4" />,
    payment: <CreditCard className="w-4 h-4" />,
    done: <Check className="w-4 h-4" />,
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 md:p-6 mb-6 relative overflow-hidden">
      {/* Background soft glow */}
      <div
        className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-40 transition-all duration-700"
        style={{
          backgroundColor: currentStage === 'done' ? '#33D6A6' : '#FFB020',
        }}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-showroom-amber/30 bg-showroom-amber/10 flex items-center justify-center text-showroom-amber shadow-amber-glow animate-pulse">
            {stageIcons[currentStage] || <Compass className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-showroom-ink tracking-wide">
              Live Agent Progress
            </h3>
            <p className="font-mono text-xs text-showroom-teal/90 mt-0.5">
              {statusText || 'Agent initialized and monitoring session state.'}
            </p>
          </div>
        </div>

        {/* Circular Gauge / Stage Step Bar */}
        <div className="w-full md:w-auto flex-1 max-w-md">
          <div className="flex items-center justify-between mb-2 px-1">
            {stages.map((stage, idx) => {
              const isActive = idx === activeIdx;
              const isPast = idx < activeIdx;
              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wider transition-colors duration-300 ${
                      isActive
                        ? 'text-showroom-amber font-bold drop-shadow-[0_0_8px_rgba(255,176,32,0.6)]'
                        : isPast
                        ? 'text-showroom-teal'
                        : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress fill bar with glow */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out shadow-amber-glow"
              style={{
                width: `${fillPercentage}%`,
                background:
                  currentStage === 'done'
                    ? 'linear-gradient(90deg, #33D6A6, #2bb78e)'
                    : 'linear-gradient(90deg, #FFB020, #f59e0b)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
