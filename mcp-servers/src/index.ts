import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';

// Form-Fill MCP Server
const formServer = new McpServer({ name: 'Application Form MCP App', version: '1.0.0' });

formServer.tool(
  'start_application',
  'Opens the rental/purchase application form for a selected vehicle listing.',
  { listingId: z.string() },
  async ({ listingId }) => {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'application_opened',
            listingId,
            resourceUri: 'ui://application-form/mcp-app.html',
          }),
        },
      ],
    };
  }
);

formServer.tool(
  'submit_application',
  'Submits filled application form to session state.',
  {
    listingId: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    targetDate: z.string(),
    preference: z.string(),
  },
  async (formData) => {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'application_submitted',
            formData,
          }),
        },
      ],
    };
  }
);

// Payment Checkout MCP Server
const paymentServer = new McpServer({ name: 'Mock Checkout Payment MCP App', version: '1.0.0' });

paymentServer.tool(
  'start_checkout',
  'Opens the mock deposit payment checkout window.',
  { applicationId: z.string() },
  async ({ applicationId }) => {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'checkout_opened',
            applicationId,
            resourceUri: 'ui://checkout/mcp-app.html',
          }),
        },
      ],
    };
  }
);

paymentServer.tool(
  'confirm_payment',
  'Confirms mock checkout payment deposit.',
  {
    cardName: z.string(),
    cardNumber: z.string(),
    expiry: z.string(),
    cvc: z.string(),
    amount: z.number(),
  },
  async (paymentData) => {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'payment_confirmed',
            confirmationCode: `CONF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            paymentData,
          }),
        },
      ],
    };
  }
);

const app = express();
app.use(cors());
app.use(express.json());

// Friendly GET / route
app.get('/', (req, res) => {
  res.json({
    service: 'AI Car Matchmaker MCP Apps Server',
    status: 'online',
    endpoints: {
      applicationMcp: 'POST /mcp/application',
      paymentMcp: 'POST /mcp/payment',
    },
    info: 'MCP App protocol endpoints accept JSON-RPC POST requests to relay tool calls into sandboxed form & checkout iframes.',
  });
});

app.get('/mcp/application', (req, res) => {
  res.json({ service: 'Application Form MCP App', protocol: 'Model Context Protocol (MCP) Streamable HTTP', transport: 'POST only' });
});

app.get('/mcp/payment', (req, res) => {
  res.json({ service: 'Payment Checkout MCP App', protocol: 'Model Context Protocol (MCP) Streamable HTTP', transport: 'POST only' });
});

app.post('/mcp/application', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => transport.close());
  await formServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.post('/mcp/payment', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => transport.close());
  await paymentServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🔌 MCP Apps Server running on http://localhost:${PORT}/mcp/application and /mcp/payment`);
});
