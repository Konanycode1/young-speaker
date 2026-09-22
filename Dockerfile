# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN apk add --no-cache openssl libc6-compat \
  && corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN pnpm exec prisma generate

FROM base AS builder
# Inlined at build time (metadataBase, sitemap, robots): must match the public URL.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3901
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# One-shot image for schema sync and seed scripts (needs the prisma CLI and tsx).
FROM base AS migrator
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY prisma ./prisma
CMD ["pnpm", "db:init"]

FROM node:24-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3901
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3901
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3901/robots.txt || exit 1
CMD ["node", "server.js"]
