import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { AgentOrchestrator } from './agent';
import { WSMessage } from './types';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const agent = new AgentOrchestrator();
const activeSockets = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  let currentSessionId = `session-${Math.random().toString(36).substring(2, 9)}`;
  activeSockets.set(currentSessionId, ws);

  const initialSession = agent.getOrCreateSession(currentSessionId);
  ws.send(JSON.stringify({ type: 'session_state', sessionId: currentSessionId, state: initialSession } as WSMessage));

  // Send the welcome message immediately on connect
  const welcome = agent.buildWelcomeMessage();
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat_token', sessionId: currentSessionId, token: welcome.text } as WSMessage));
      ws.send(JSON.stringify({ type: 'chat_end', sessionId: currentSessionId, state: initialSession, suggestions: welcome.suggestions } as WSMessage));
    }
  }, 300);

  ws.on('message', async (data: string) => {
    try {
      const parsed: WSMessage = JSON.parse(data.toString());
      if (parsed.sessionId) {
        currentSessionId = parsed.sessionId;
        activeSockets.set(currentSessionId, ws);
      }

      if (!parsed.token) return;

      const userText = parsed.token;

      await agent.processUserMessage(
        currentSessionId,
        userText,
        (chatToken: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'chat_token', sessionId: currentSessionId, token: chatToken } as WSMessage));
          }
        },
        (a2uiMsgs: any[]) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'a2ui_messages', sessionId: currentSessionId, messages: a2uiMsgs } as WSMessage));
          }
        },
        (chips: string[]) => {
          if (ws.readyState === WebSocket.OPEN) {
            const updatedState = agent.getOrCreateSession(currentSessionId);
            ws.send(JSON.stringify({ type: 'chat_end', sessionId: currentSessionId, state: updatedState, suggestions: chips } as WSMessage));
          }
        }
      );
    } catch (err: any) {
      console.error('WS error:', err);
      ws.send(JSON.stringify({ type: 'error', error: err.message || 'Internal error' } as WSMessage));
    }
  });

  ws.on('close', () => activeSockets.delete(currentSessionId));
});

// Application form submit relay
app.post('/api/application/submit', (req, res) => {
  const { sessionId, formData } = req.body;
  const targetId = sessionId || Array.from(activeSockets.keys())[0] || 'default';
  const { session, a2uiMessages } = agent.handleApplicationSubmit(targetId, formData);
  const ws = activeSockets.get(targetId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'a2ui_messages', sessionId: targetId, messages: a2uiMessages } as WSMessage));
    ws.send(JSON.stringify({ type: 'chat_token', sessionId: targetId, token: `\n\n✅ **Application Received!**\nName: ${formData.name}\nDate: ${formData.targetDate}\nPreference: ${formData.preference}\n\nYour **Mock Checkout** is now open. Click **Confirm Booking** to finalize!` } as WSMessage));
    ws.send(JSON.stringify({ type: 'chat_end', sessionId: targetId, state: session, suggestions: ['Confirm payment', 'Choose a different car'] } as WSMessage));
  }
  res.json({ success: true, session });
});

// Payment confirm relay
app.post('/api/payment/confirm', (req, res) => {
  const { sessionId, paymentData } = req.body;
  const targetId = sessionId || Array.from(activeSockets.keys())[0] || 'default';
  const { session, a2uiMessages } = agent.handlePaymentSubmit(targetId, paymentData);
  const ws = activeSockets.get(targetId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'a2ui_messages', sessionId: targetId, messages: a2uiMessages } as WSMessage));
    ws.send(JSON.stringify({ type: 'chat_token', sessionId: targetId, token: `\n\n🎉 **Booking Confirmed!**\nConfirmation: **CAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}**\n\nYour reservation is locked in. Thank you for using AI Car Matchmaker!` } as WSMessage));
    ws.send(JSON.stringify({ type: 'chat_end', sessionId: targetId, state: session, suggestions: ['Start a new search', 'Book another vehicle'] } as WSMessage));
  }
  res.json({ success: true, session });
});

app.get('/', (req, res) => {
  res.json({ service: 'AI Car Matchmaker Backend', status: 'online', wsEndpoint: 'ws://localhost:3001/ws', activeSessions: activeSockets.size });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', activeSessions: activeSockets.size }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 AI Car Matchmaker Backend on http://localhost:${PORT} (WS: /ws)`));
