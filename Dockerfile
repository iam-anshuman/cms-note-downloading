# -------- Base Image --------
FROM node:22-slim AS base
WORKDIR /app

# -------- Dependencies --------
FROM base AS deps

# Install required build tools for sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

# Clean install dependencies
RUN npm ci

# Rebuild better-sqlite3 for Linux
RUN npm rebuild better-sqlite3

# -------- Builder --------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# -------- Runner --------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public

# Create required directories
RUN mkdir .next && chown nextjs:nodejs .next
RUN mkdir data && chown nextjs:nodejs data
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]