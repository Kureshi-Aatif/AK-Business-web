# Multi-stage secure Docker build for AK Digital Studio

FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine

# Set secure environment
ENV NODE_ENV=production
ENV PORT=3000

# Install dumb-init to properly handle PID 1 signals
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Create non-root user and directories
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 -G nodejs && \
    mkdir -p /usr/src/app/data /usr/src/app/backups && \
    chown -R nodeapp:nodejs /usr/src/app

# Copy dependencies and application code
COPY --chown=nodeapp:nodejs --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=nodeapp:nodejs . .

# Run as non-privileged user
USER nodeapp

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
