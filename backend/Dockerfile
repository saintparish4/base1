# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code and tests
COPY src/ ./src/
COPY tests/ ./tests/

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cryptopay -u 1001

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tests ./tests
COPY --from=builder /app/src ./src

# Create logs directory
RUN mkdir -p logs && chown -R cryptopay:nodejs logs

# Switch to non-root user
USER cryptopay

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

EXPOSE 3001

CMD ["node", "dist/src/index.js"]