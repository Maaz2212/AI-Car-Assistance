'use client';

import React from 'react';
import { Shield, X } from 'lucide-react';

interface McpAppSandboxProps {
  phase: 'form' | 'payment';
  selectedListingId?: string | null;
  selectedCar?: any;
  appliedFormData?: any;
  sessionId: string;
  onFormSubmitted?: (formData: any) => void;
  onPaymentSubmitted?: (paymentData: any) => void;
  onClose?: () => void;
}

export const McpAppSandbox: React.FC<McpAppSandboxProps> = ({
  phase,
  selectedListingId,
  selectedCar,
  appliedFormData,
  sessionId,
  onFormSubmitted,
  onPaymentSubmitted,
  onClose,
}) => {
  const isForm = phase === 'form';

  const carName = selectedCar ? `${selectedCar.year || ''} ${selectedCar.brand || ''} ${selectedCar.model || ''} ${selectedCar.trim || ''}`.trim() : (selectedListingId || 'Vehicle');
  const carPrice = selectedCar?.netPrice ?? selectedCar?.price ?? null;
  const dailyRate = selectedCar?.dailyRate ?? null;
  const pref = appliedFormData?.preference || 'Full Cash Purchase';
  const applicantName = appliedFormData?.name || 'Alex Morgan';

  let depositAmount = 500;
  let depositLabel = 'Reservation Deposit';
  let priceBreakdownHtml = '';

  if (pref === 'Full Cash Purchase') {
    const total = carPrice || 35000;
    depositAmount = Math.round(total * 0.05);
    depositLabel = 'Full Cash Lock Deposit';
    priceBreakdownHtml = `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Full Vehicle Cash Price:</span>
        <strong style="color:#F4F3EF;">$${total.toLocaleString()}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Lock Deposit (5%):</span>
        <strong style="color:#33D6A6;">$${depositAmount.toLocaleString()}</strong>
      </div>
    `;
  } else if (pref === 'Monthly Lease / Rent') {
    const rate = dailyRate || 85;
    const monthlyEst = rate * 25;
    depositAmount = Math.round(rate * 10);
    depositLabel = 'Lease First Month & Security Deposit';
    priceBreakdownHtml = `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Daily Rental Rate:</span>
        <strong style="color:#F4F3EF;">$${rate}/day</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Est. Monthly Lease:</span>
        <strong style="color:#F4F3EF;">$${monthlyEst.toLocaleString()}/mo</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Security & First Payment Deposit:</span>
        <strong style="color:#33D6A6;">$${depositAmount.toLocaleString()}</strong>
      </div>
    `;
  } else {
    const total = carPrice || 35000;
    const monthlyLoan = Math.round((total * 0.85) / 60);
    depositAmount = Math.round(total * 0.10);
    depositLabel = 'Financing Down Payment Deposit';
    priceBreakdownHtml = `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Vehicle Price:</span>
        <strong style="color:#F4F3EF;">$${total.toLocaleString()}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Est. Monthly Loan (60 mo):</span>
        <strong style="color:#F4F3EF;">~$${monthlyLoan.toLocaleString()}/mo</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Down Payment Deposit (10%):</span>
        <strong style="color:#33D6A6;">$${depositAmount.toLocaleString()}</strong>
      </div>
    `;
  }

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
        input:focus, select:focus {
          border-color: #FFB020;
          background: rgba(255, 255, 255, 0.1);
        }
        .phone-group {
          display: flex;
          gap: 8px;
        }
        .phone-group select {
          width: 140px;
          flex-shrink: 0;
          background: rgba(18, 20, 26, 0.95);
        }
        .phone-group input {
          flex: 1;
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
        <p style="font-size:13px; color:#9CA3AF; margin-bottom:16px; font-family:monospace;">
          Selected Vehicle: <strong style="color:#FFB020;">${carName}</strong>
          ${carPrice ? `<span style="color:#33D6A6; margin-left:8px;">($${carPrice.toLocaleString()})</span>` : dailyRate ? `<span style="color:#33D6A6; margin-left:8px;">($${dailyRate}/day)</span>` : ''}
        </p>
        <form id="appForm">
          <label>Full Legal Name</label>
          <input type="text" id="name" placeholder="e.g. Alex Morgan" />

          <label>Email Address</label>
          <input type="email" id="email" placeholder="e.g. alex.morgan@example.com" />

          <label>Phone Number (Select Country Code)</label>
          <div class="phone-group">
            <select id="countryCode">
              <option value="+91">🇮🇳 +91 (IND)</option>
              <option value="+1" selected>🇺🇸 +1 (USA)</option>
              <option value="+44">🇬🇧 +44 (UK)</option>
              <option value="+1">🇨🇦 +1 (CAN)</option>
              <option value="+61">🇦🇺 +61 (AUS)</option>
              <option value="+49">🇩🇪 +49 (GER)</option>
              <option value="+81">🇯🇵 +81 (JPN)</option>
              <option value="+971">🇦🇪 +971 (UAE)</option>
              <option value="+65">🇸🇬 +65 (SGP)</option>
              <option value="+33">🇫🇷 +33 (FRA)</option>
            </select>
            <input type="tel" id="phone" placeholder="98765 43210" />
          </div>

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
          const countryCodeVal = document.getElementById('countryCode').value;
          const phoneVal = document.getElementById('phone').value.trim();
          const dateVal = document.getElementById('targetDate').value;

          const fullPhone = phoneVal ? (countryCodeVal + ' ' + phoneVal) : (countryCodeVal + ' 98765 43210');

          const formData = {
            name: nameVal || 'Alex Morgan',
            email: emailVal || 'alex.morgan@example.com',
            phone: fullPhone,
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
        .summary-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 13px;
          font-family: monospace;
        }
        label {
          display: block;
          margin-top: 12px;
          margin-bottom: 4px;
          font-size: 11px;
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
          padding: 9px 12px;
          font-size: 13px;
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
          margin-top: 16px;
          width: 100%;
          background: #33D6A6;
          color: #000;
          border: none;
          font-weight: 700;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
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
          💳 Checkout & Booking Confirmation
          <span class="badge">Verified MCP Payment</span>
        </h3>
        
        <div class="summary-box">
          <div style="display:flex; justify-mode:space-between; justify-content:space-between; margin-bottom:6px; color:#FFB020; font-weight:bold;">
            <span>Vehicle:</span>
            <span>${carName}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#9CA3AF;">
            <span>Applicant:</span>
            <span>${applicantName}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#9CA3AF;">
            <span>Option Chosen:</span>
            <span style="color:#33D6A6; font-weight:bold;">${pref}</span>
          </div>
          <hr style="border:none; border-top:1px dashed rgba(255,255,255,0.15); margin:8px 0;" />
          ${priceBreakdownHtml}
        </div>

        <form id="payForm">
          <label>Cardholder Name</label>
          <input type="text" id="cardName" value="${applicantName}" placeholder="e.g. Alex Morgan" />

          <label>Card Number (Demo Mock Card)</label>
          <input type="text" id="cardNumber" placeholder="e.g. 4532 •••• •••• 8892" />

          <div class="row">
            <div style="flex:1;">
              <label>Expiry</label>
              <input type="text" id="expiry" placeholder="e.g. 08/28" />
            </div>
            <div style="flex:1;">
              <label>CVC</label>
              <input type="text" id="cvc" placeholder="492" />
            </div>
          </div>

          <button type="submit">Confirm ${depositLabel} ($${depositAmount.toLocaleString()}.00)</button>
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
            cardName: cardName || '${applicantName}',
            cardNumber: cardNumber || '4532 8920 1234 8892',
            expiry: expiry || '08/28',
            cvc: cvc || '492',
            amount: ${depositAmount},
            preference: '${pref}',
            vehicle: '${carName}'
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
        className="w-full h-[520px] rounded-xl border-0"
        title="MCP App Sandbox"
      />
    </div>
  );
};
