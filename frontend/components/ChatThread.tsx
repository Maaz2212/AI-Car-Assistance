'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ChevronRight } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

interface ChatThreadProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isStreaming?: boolean;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ messages, onSendMessage, isStreaming }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleChipClick = (chip: string) => {
    if (isStreaming) return;
    onSendMessage(chip);
  };

  // Find the last agent message with suggestions to render chips
  const lastAgentMsg = [...messages].reverse().find((m) => m.sender === 'agent');

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden relative border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-showroom-amber/20 border border-showroom-amber/40 flex items-center justify-center text-showroom-amber shadow-amber-glow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-showroom-ink">AI Car Concierge</h2>
            <span className="font-mono text-[10px] text-showroom-teal flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-showroom-teal animate-pulse" />
              Multistep Agent Active • 160+ Listings
            </span>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, msgIndex) => (
          <div key={msg.id}>
            <div className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'agent' && (
                <div className="w-8 h-8 rounded-lg bg-showroom-amber/20 border border-showroom-amber/40 flex items-center justify-center text-showroom-amber shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-showroom-amber/20 text-showroom-ink border border-showroom-amber/30 rounded-tr-none'
                    : 'glass-panel text-showroom-ink rounded-tl-none border-white/10'
                }`}
              >
                <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                <span className="font-mono text-[9px] text-gray-400 mt-2 block text-right">{msg.timestamp}</span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-showroom-teal/20 border border-showroom-teal/40 flex items-center justify-center text-showroom-teal shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Suggestion Chips — shown only on the last agent message */}
            {msg.sender === 'agent' &&
              msg.suggestions &&
              msg.suggestions.length > 0 &&
              msgIndex === messages.length - 1 &&
              !isStreaming && (
                <div className="flex flex-wrap gap-2 mt-3 pl-11">
                  {msg.suggestions.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-showroom-teal/20 border border-white/10 hover:border-showroom-teal/40 text-showroom-ink hover:text-showroom-teal text-xs font-sans py-1.5 px-3 rounded-full transition-all duration-200 active:scale-95"
                    >
                      <ChevronRight className="w-3 h-3 opacity-60" />
                      {chip}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-showroom-amber/20 border border-showroom-amber/40 flex items-center justify-center text-showroom-amber shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="glass-panel rounded-2xl rounded-tl-none p-3 text-showroom-teal font-mono text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-showroom-teal animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-showroom-teal animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-showroom-teal animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2">Searching marketplace...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. SUV under $35k for family trips..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-showroom-ink placeholder-gray-500 focus:outline-none focus:border-showroom-amber/60 font-sans"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="bg-showroom-amber hover:bg-amber-400 disabled:opacity-50 text-black font-semibold p-3 rounded-xl flex items-center justify-center shadow-amber-glow transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
