'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, ChatMessage } from '../components/ChatThread';
import { GaugeDial } from '../components/GaugeDial';
import { CarCard } from '../components/CarCard';
import { McpAppSandbox } from '../components/McpAppSandbox';
import { CompareModal } from '../components/CompareModal';
import { TradeInBanner } from '../components/TradeInBanner';
import { LandingHero } from '../components/LandingHero';
import { TrendingFleet } from '../components/TrendingFleet';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { CarDetailsModal } from '../components/CarDetailsModal';
import { Car, Sparkles, ShieldCheck, Scale, ArrowRight, Bot } from 'lucide-react';

export default function ShowroomPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const isNewAgentTurnRef = useRef<boolean>(true);

  // A2UI Surface & Session State
  const [currentStage, setCurrentStage] = useState<string>('interview');
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Gathering driving preferences...');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // Detail Modal & Feature States
  const [selectedDetailCar, setSelectedDetailCar] = useState<any | null>(null);
  const [appliedFormData, setAppliedFormData] = useState<any>(null);
  const [tradeIn, setTradeIn] = useState<any>(null);
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to Backend WebSocket
    const ws = new WebSocket('ws://localhost:3001/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to AI Car Matchmaker WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'session_state') {
          if (data.sessionId) setSessionId(data.sessionId);
          if (data.state) {
            setCurrentStage(data.state.phase || 'interview');
            setSelectedListingId(data.state.selectedListingId);
            if (data.state.tradeIn !== undefined) setTradeIn(data.state.tradeIn);
          }
        }

        if (data.type === 'chat_token') {
          setIsStreaming(true);
          setMessages((prev) => {
            if (isNewAgentTurnRef.current) {
              isNewAgentTurnRef.current = false;
              return [
                ...prev,
                {
                  id: `agent-${Date.now()}`,
                  sender: 'agent',
                  text: data.token,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            } else {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'agent') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + data.token },
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: `agent-${Date.now()}`,
                    sender: 'agent',
                    text: data.token,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ];
              }
            }
          });
        }

        if (data.type === 'chat_end') {
          setIsStreaming(false);
          isNewAgentTurnRef.current = true;
          if (data.state) {
            setCurrentStage(data.state.phase || 'interview');
            setSelectedListingId(data.state.selectedListingId);
            if (data.state.tradeIn !== undefined) setTradeIn(data.state.tradeIn);
          }
          if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            setMessages((prev) => {
              const lastAgentIdx = [...prev].reverse().findIndex((m) => m.sender === 'agent');
              if (lastAgentIdx === -1) return prev;
              const realIdx = prev.length - 1 - lastAgentIdx;
              const updated = [...prev];
              updated[realIdx] = { ...updated[realIdx], suggestions: data.suggestions };
              return updated;
            });
          }
        }

        if (data.type === 'a2ui_messages' && Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            if (msg.updateComponents) {
              const surfaceId = msg.updateComponents.surfaceId;
              const components = msg.updateComponents.components;

              if (surfaceId === 'progress' && components?.[0]?.props) {
                const props = components[0].props;
                const newStage = props.currentStage || 'interview';
                setCurrentStage(newStage);
                setStageIndex(props.stageIndex ?? 0);
                setStatusText(props.statusText || '');
              } else if (surfaceId === 'catalogue' && Array.isArray(components)) {
                const recs = components.map((comp: any) => comp.props);
                if (recs.length > 0) setRecommendations(recs);
              }
            }
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Precise Auto-Scroll to Form Container
  useEffect(() => {
    if (currentStage === 'form' || currentStage === 'payment') {
      const timer = setTimeout(() => {
        const el = document.getElementById('mcp-form-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  const scrollToAssistant = () => {
    const el = document.getElementById('ai-showroom');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    isNewAgentTurnRef.current = true;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsStreaming(true);

    wsRef.current.send(
      JSON.stringify({
        type: 'chat_token',
        sessionId,
        token: text,
      })
    );
  };

  const handleSelectCar = (listingId: string) => {
    setSelectedListingId(listingId);
    handleSendMessage(`Apply for ${listingId}`);
  };

  const handleCloseForm = () => {
    setCurrentStage(recommendations.length > 0 ? 'recommending' : 'interview');
    setSelectedListingId(null);
    handleSendMessage('Cancel application and return to recommendations');
  };

  const handleMatchVehicle = (vehicleName: string) => {
    handleSendMessage(`Match recommendations for ${vehicleName} with trade-in offset`);
    scrollToAssistant();
  };

  const handleToggleCompare = (carId: string) => {
    setComparedCarIds((prev) => {
      if (prev.includes(carId)) return prev.filter((id) => id !== carId);
      if (prev.length >= 2) return [prev[1], carId];
      return [...prev, carId];
    });
  };

  const handleClearTradeIn = () => {
    setTradeIn(null);
    handleSendMessage('Clear trade-in');
  };

  const handleFormSubmit = async (formData: any) => {
    setAppliedFormData(formData);
    try {
      const res = await fetch('http://localhost:3001/api/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, formData }),
      });
      const data = await res.json();
      if (data.session) {
        setCurrentStage('payment');
      }
    } catch (e) {
      console.error('Error submitting application form:', e);
    }
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      const res = await fetch('http://localhost:3001/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, paymentData }),
      });
      const data = await res.json();
      if (data.session) {
        setCurrentStage('done');
      }
    } catch (e) {
      console.error('Error confirming payment:', e);
    }
  };

  const stagesList = [
    { id: 'interview', label: 'Interview' },
    { id: 'researching', label: 'Research' },
    { id: 'recommending', label: 'Recommend' },
    { id: 'form', label: 'Application' },
    { id: 'payment', label: 'Checkout' },
    { id: 'done', label: 'Confirmed' },
  ];

  const comparedCars = recommendations.filter((c) => comparedCarIds.includes(c.id));

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 gap-8 max-w-[1700px] mx-auto relative">
      {/* Showroom Navigation Header */}
      <header className="glass-panel sticky top-4 z-50 rounded-2xl p-4 px-6 flex items-center justify-between shadow-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-showroom-amber via-amber-500 to-showroom-teal flex items-center justify-center text-black font-extrabold shadow-amber-glow">
            <Car className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight flex items-center gap-2.5">
              <span>Car<span className="text-showroom-amber">मैच</span></span>
              <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-showroom-teal border border-showroom-teal/30">
                v2.0 NEXT-GEN
              </span>
            </h1>
            <p className="font-mono text-xs text-gray-400">
              AI Vehicle Discovery & Interactive Showroom
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => {
              const el = document.getElementById('trending-fleet');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-mono text-xs text-gray-300 hover:text-white transition-colors"
          >
            Our Showroom
          </button>

          <button
            onClick={scrollToAssistant}
            className="font-mono text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-showroom-teal" />
            <span>AI Showroom</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-showroom-teal" />
            <span>Session: <strong className="text-white">{sessionId || 'Connecting...'}</strong></span>
          </div>

          <button
            onClick={scrollToAssistant}
            className="bg-showroom-teal hover:bg-teal-300 text-black font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-teal-glow active:scale-95"
          >
            Launch AI Matchmaker
          </button>
        </div>
      </header>

      {/* 1. Hero & Spline 3D Viewport Section */}
      <LandingHero
        onGetStarted={scrollToAssistant}
        onSelectVehicle={handleMatchVehicle}
      />

      {/* 2. Our Showroom Section (Registered Listings: Full specs & direct application) */}
      <TrendingFleet onViewDetails={(vehicle) => setSelectedDetailCar(vehicle)} onSelectCar={handleSelectCar} />

      {/* 3. Features & Platform Capabilities Grid */}
      <FeaturesGrid />

      {/* 4. Main Interactive AI Showroom & Assistant Section */}
      <section id="ai-showroom" className="pt-6 space-y-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-showroom-teal/20 border border-showroom-teal/40 flex items-center justify-center text-showroom-teal">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
                Interactive AI Showroom Floor
                <span className="text-xs font-mono bg-showroom-teal/20 text-showroom-teal px-2 py-0.5 rounded-full">
                  LIVE WORKSPACE
                </span>
              </h2>
              <p className="font-mono text-xs text-gray-400">
                Chat with the AI agent to receive tailored vehicle recommendations & appraisals
              </p>
            </div>
          </div>
        </div>

        {/* Main Split Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 40%: Chat Host */}
          <section className="lg:col-span-5 h-[calc(100vh-140px)] sticky top-24">
            <ChatThread
              messages={messages}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
            />
          </section>

          {/* Right 60%: Showroom Floor & Catalogue */}
          <section className="lg:col-span-7 flex flex-col gap-6 min-h-[calc(100vh-140px)]">
            {/* Progress Gauge Dial */}
            <GaugeDial
              currentStage={currentStage}
              stageIndex={stageIndex}
              statusText={statusText}
              stages={stagesList}
            />

            {/* MCP App Sandboxed Form / Checkout with Close (X) Button */}
            {(currentStage === 'form' || currentStage === 'payment') && (
              <McpAppSandbox
                phase={currentStage}
                selectedListingId={selectedListingId}
                selectedCar={recommendations.find((c) => c.id === selectedListingId)}
                appliedFormData={appliedFormData}
                sessionId={sessionId}
                onFormSubmitted={handleFormSubmit}
                onPaymentSubmitted={handlePaymentSubmit}
                onClose={handleCloseForm}
              />
            )}

            {/* Trade-in Valuation Banner */}
            <TradeInBanner
              tradeIn={tradeIn}
              onTradeInSubmit={handleSendMessage}
              onClearTradeIn={handleClearTradeIn}
            />

            {/* Ranked Car Catalogue */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-lg text-showroom-ink flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-showroom-amber" />
                  Ranked Car Catalogue
                </h3>
                <span className="font-mono text-xs text-showroom-teal">
                  {recommendations.length > 0
                    ? `${recommendations.length} Matching Listings`
                    : 'Awaiting search parameters...'}
                </span>
              </div>

              {recommendations.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[380px] border-dashed border-white/10">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-4 animate-pulse">
                    <Car className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading font-semibold text-lg text-gray-300 mb-1">
                    Showroom Floor Ready
                  </h4>
                  <p className="font-sans text-sm text-gray-500 max-w-md">
                    Answer the agent's questions in the chat to see real-time ranked recommendations with match scores, trade-in valuations, and side-by-side comparison.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((car: any) => (
                    <CarCard
                      key={car.id}
                      {...car}
                      onSelectCar={handleSelectCar}
                      onViewDetails={(detailCar) => setSelectedDetailCar(detailCar)}
                      isCompared={comparedCarIds.includes(car.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </section>

      {/* Floating Comparison Bar */}
      {comparedCarIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/90 backdrop-blur-xl border border-showroom-amber/40 rounded-2xl p-3 px-5 flex items-center gap-4 shadow-amber-glow animate-fade-in">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-showroom-amber" />
            <span className="font-mono text-xs text-showroom-ink">
              Compare Mode ({comparedCarIds.length}/2 selected)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {comparedCarIds.length === 2 ? (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="bg-showroom-amber hover:bg-amber-400 text-black font-mono font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-amber-glow"
              >
                <span>View Comparison</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="font-mono text-[11px] text-gray-400">
                Click "+ Compare" on a 2nd car
              </span>
            )}

            <button
              onClick={() => setComparedCarIds([])}
              className="text-xs text-gray-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Full Vehicle Specifications Modal */}
      {selectedDetailCar && (
        <CarDetailsModal
          car={selectedDetailCar}
          onClose={() => setSelectedDetailCar(null)}
          onSelectCar={handleSelectCar}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {isCompareOpen && (
        <CompareModal
          cars={comparedCars}
          tradeIn={tradeIn}
          onClose={() => setIsCompareOpen(false)}
          onSelectCar={handleSelectCar}
        />
      )}
    </div>
  );
}
