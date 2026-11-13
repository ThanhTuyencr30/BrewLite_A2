# Phase 1: Base image
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Phase 2: Builder
FROM base AS builder
WORKDIR /app

# Biến môi trường giả lập chỉ dùng để generate prisma trong quá trình build
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewlite_db"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @brewlite/api exec prisma generate
RUN pnpm --filter @brewlite/api build

# Phase 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3001
CMD ["sh", "apps/api/docker-entrypoint.sh"]
