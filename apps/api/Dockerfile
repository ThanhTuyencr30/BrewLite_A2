# Phase 1: Base image
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Phase 2: Builder
FROM base AS builder
WORKDIR /app

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewlite_db"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# Phase 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]