# Backend Dockerfile for Express API
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the TypeScript application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package.json and install only production dependencies
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
RUN npm install --production && npm cache clean --force

# Copy the built application
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist

# Create directories for logs and uploads
RUN mkdir -p logs uploads
RUN chown expressjs:nodejs logs uploads

USER expressjs

EXPOSE 4000

ENV PORT 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["node", "dist/index-simple.js"]