FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for root and frontend
COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm ci
RUN cd frontend && npm ci

# Copy application source code
COPY . .

# Generate mock car listings dataset (128 listings, 12 categories, 17 brands)
RUN npx tsx scripts/generate-listings.ts

# Build Next.js production frontend bundle
RUN cd frontend && npm run build

# Expose ports: 3000 (Next.js), 3001 (Backend/WS), 3002 (MCP Servers)
EXPOSE 3000 3001 3002

# Launch all 3 services concurrently
CMD ["sh", "-c", "npx tsx backend/src/server.ts & npx tsx mcp-servers/src/index.ts & cd frontend && npm start"]
