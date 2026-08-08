'use client';

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface McpAppSandboxProps {
  phase: 'form' | 'payment';
  selectedListingId?: string | null;
  sessionId: string;
  onFormSubmitted?: (formData: any) => void;
  onPaymentSubmitted?: (paymentData: any) => void;
}

export const McpAppSandbox: React.FC<McpAppSandboxProps> = ({
  phase,
  selectedListingId,
  sessionId,
  onFormSubmitted,
  onPaymentSubmitted,
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
        }
        input:focus {
          border-color: #FFB020;
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
          <input type="text" id="name" value="Jane Doe" required />

          <label>Email Address</label>
          <input type="email" id="email" value="jane.doe@example.com" required />

          <label>Phone Number</label>
          <input type="tel" id="phone" value="+1 (555) 234-5678" required />

          <label>Target Delivery / Pickup Date</label>
          <input type="date" id="targetDate" value="${new Date().toISOString().split('T')[0]}" required />

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
          const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            targetDate: document.getElementById('targetDate').value,
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
        }
        input:focus {
          border-color: #33D6A6;
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
          <input type="text" id="cardName" value="Jane Doe" required />

          <label>Card Number (Mock)</label>
          <input type="text" id="cardNumber" value="4000 1234 5678 9010" required />

          <div class="row">
            <div style="flex:1;">
              <label>Expiry</label>
              <input type="text" id="expiry" value="12/28" required />
            </div>
            <div style="flex:1;">
              <label>CVC</label>
              <input type="text" id="cvc" value="888" required />
            </div>
          </div>

          <button type="submit">Confirm Booking Deposit ($500.00)</button>
        </form>
      </div>

      <script>
        document.getElementById('payForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const paymentData = {
            cardName: document.getElementById('cardName').value,
            cardNumber: document.getElementById('cardNumber').value,
            expiry: document.getElementById('expiry').value,
            cvc: document.getElementById('cvc').value,
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
    <div className="w-full glass-panel rounded-2xl p-2 border border-showroom-teal/30 mb-6 shadow-teal-glow">
      <div className="flex items-center gap-2 p-2 font-mono text-xs text-showroom-teal border-b border-white/10 mb-2">
        <Shield className="w-4 h-4 text-showroom-teal" />
        <span>SANDBOXED MCP APP CONTAINER (IFRAME SRCDOC)</span>
      </div>
      <iframe
        srcDoc={isForm ? formHtml : paymentHtml}
        className="w-full h-[460px] rounded-xl border-0"
        title="MCP App Sandbox"
      />
    </div>
  );
};
