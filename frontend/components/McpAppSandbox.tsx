'use client';

import React from 'react';
import { Shield, X } from 'lucide-react';

interface McpAppSandboxProps {
  phase: 'form' | 'payment';
  selectedListingId?: string | null;
  sessionId: string;
  onFormSubmitted?: (formData: any) => void;
  onPaymentSubmitted?: (paymentData: any) => void;
  onClose?: () => void;
}

export const McpAppSandbox: React.FC<McpAppSandboxProps> = ({
  phase,
  selectedListingId,
  sessionId,
  onFormSubmitted,
  onPaymentSubmitted,
  onClose,
}) => {
  const isForm = phase === 'form';

  const formHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          background: rgba(11, 12, 16, 0.95);
          color: #F4F3EF;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          padding: 24px;
          margin: 0;
        }
        .card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        h3 {
          margin-top: 0;
          color: #FFB020;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .badge {
          background: rgba(51, 214, 166, 0.2);
          color: #33D6A6;
          border: 1px solid rgba(51, 214, 166, 0.4);
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 99px;
          font-family: monospace;
          text-transform: uppercase;
        }
        label {
          display: block;
          margin-top: 14px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #9CA3AF;
          font-family: monospace;
          text-transform: uppercase;
        }
        input, select, textarea {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #F4F3EF;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }
        input::placeholder {
          color: rgba(244, 243, 239, 0.35);
          font-style: italic;
        }
        input:focus {
          border-color: #FFB020;
          background: rgba(255, 255, 255, 0.1);
        }
        button {
          margin-top: 20px;
          width: 100%;
          background: #FFB020;
          color: #000;
          border: none;
          font-weight: 700;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 15px;
          transition: background 0.2s;
        }
        button:hover {
          background: #f59e0b;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h3>
          📝 Rental & Purchase Application
          <span class="badge">Sandboxed MCP App</span>
        </h3>
        <p style="font-size:13px; color:#9CA3AF; margin-bottom:16px;">
          Listing Reference: <strong style="color:#F4F3EF;">${selectedListingId || 'CAR-SELECTED'}</strong>
        </p>
        <form id="appForm">
          <label>Full Legal Name</label>
          <input type="text" id="name" placeholder="e.g. Jane Doe" />

          <label>Email Address</label>
          <input type="email" id="email" placeholder="e.g. jane.doe@example.com" />

          <label>Phone Number</label>
          <input type="tel" id="phone" placeholder="e.g. +1 (555) 234-5678" />

          <label>Target Delivery / Pickup Date</label>
          <input type="date" id="targetDate" value="${new Date().toISOString().split('T')[0]}" />

          <label>Financing & Rental Preference</label>
          <select id="preference">
            <option value="Full Cash Purchase">Full Cash Purchase</option>
            <option value="Monthly Lease / Rent">Monthly Lease / Rent</option>
            <option value="Dealership Financing">Dealership Financing</option>
          </select>

          <button type="submit">Submit Application</button>
        </form>
      </div>

      <script>
        document.getElementById('appForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const nameVal = document.getElementById('name').value.trim();
          const emailVal = document.getElementById('email').value.trim();
          const phoneVal = document.getElementById('phone').value.trim();
          const dateVal = document.getElementById('targetDate').value;

          const formData = {
            name: nameVal || 'Jane Doe',
            email: emailVal || 'jane.doe@example.com',
            phone: phoneVal || '+1 (555) 234-5678',
            targetDate: dateVal || '${new Date().toISOString().split('T')[0]}',
            preference: document.getElementById('preference').value,
            listingId: '${selectedListingId || ''}'
          };
          window.parent.postMessage({ type: 'MCP_APP_SUBMIT', action: 'submit_application', formData }, '*');
        });
      </script>
    </body>
    </html>
  `;

  const paymentHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          background: rgba(11, 12, 16, 0.95);
          color: #F4F3EF;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          padding: 24px;
          margin: 0;
        }
        .card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(51, 214, 166, 0.3);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 0 30px rgba(51, 214, 166, 0.15);
        }
        h3 {
          margin-top: 0;
          color: #33D6A6;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .badge {
          background: rgba(51, 214, 166, 0.2);
          color: #33D6A6;
          border: 1px solid rgba(51, 214, 166, 0.4);
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 99px;
          font-family: monospace;
          text-transform: uppercase;
        }
        label {
          display: block;
          margin-top: 14px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #9CA3AF;
          font-family: monospace;
          text-transform: uppercase;
        }
        input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #F4F3EF;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }
        input::placeholder {
          color: rgba(244, 243, 239, 0.35);
          font-style: italic;
        }
        input:focus {
          border-color: #33D6A6;
          background: rgba(255, 255, 255, 0.1);
        }
        .row {
          display: flex;
          gap: 12px;
        }
        button {
          margin-top: 20px;
          width: 100%;
          background: #33D6A6;
          color: #000;
          border: none;
          font-weight: 700;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 15px;
          transition: background 0.2s;
        }
        button:hover {
          background: #2bb78e;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h3>
          💳 Mock Checkout Payment
          <span class="badge">Demo — No real payment</span>
        </h3>
        <p style="font-size:12px; color:#33D6A6; margin-bottom:16px; font-family:monospace;">
          ✓ Application verified. Complete checkout reservation deposit ($500 deposit).
        </p>
        <form id="payForm">
          <label>Cardholder Name</label>
          <input type="text" id="cardName" placeholder="e.g. Jane Doe" />

          <label>Card Number (Mock)</label>
          <input type="text" id="cardNumber" placeholder="e.g. 4000 1234 5678 9010" />

          <div class="row">
            <div style="flex:1;">
              <label>Expiry</label>
              <input type="text" id="expiry" placeholder="MM/YY" />
            </div>
            <div style="flex:1;">
              <label>CVC</label>
              <input type="text" id="cvc" placeholder="888" />
            </div>
          </div>

          <button type="submit">Confirm Booking Deposit ($500.00)</button>
        </form>
      </div>

      <script>
        document.getElementById('payForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const cardName = document.getElementById('cardName').value.trim();
          const cardNumber = document.getElementById('cardNumber').value.trim();
          const expiry = document.getElementById('expiry').value.trim();
          const cvc = document.getElementById('cvc').value.trim();

          const paymentData = {
            cardName: cardName || 'Jane Doe',
            cardNumber: cardNumber || '4000 1234 5678 9010',
            expiry: expiry || '12/28',
            cvc: cvc || '888',
            amount: 500.00
          };
          window.parent.postMessage({ type: 'MCP_APP_SUBMIT', action: 'submit_payment', paymentData }, '*');
        });
      </script>
    </body>
    </html>
  `;

  React.useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'MCP_APP_SUBMIT') {
        if (event.data.action === 'submit_application') {
          onFormSubmitted?.(event.data.formData);
        } else if (event.data.action === 'submit_payment') {
          onPaymentSubmitted?.(event.data.paymentData);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onFormSubmitted, onPaymentSubmitted]);

  return (
    <div id="mcp-form-container" className="w-full glass-panel rounded-2xl p-2 border border-showroom-teal/30 mb-6 shadow-teal-glow relative">
      <div className="flex items-center justify-between p-2 font-mono text-xs text-showroom-teal border-b border-white/10 mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-showroom-teal" />
          <span>SANDBOXED MCP APP CONTAINER (APPLICATION / CHECKOUT)</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-gray-400 hover:text-white bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 border border-white/10 px-2.5 py-1 rounded-lg transition-all"
            title="Cancel and close form"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Form</span>
          </button>
        )}
      </div>

      <iframe
        srcDoc={isForm ? formHtml : paymentHtml}
        className="w-full h-[460px] rounded-xl border-0"
        title="MCP App Sandbox"
      />
    </div>
  );
};
