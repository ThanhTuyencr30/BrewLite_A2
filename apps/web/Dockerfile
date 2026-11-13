# Phase 1: Base image
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Phase 2: Builder
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewlite_db"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @brewlite/web build

# Phase 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3000

# Chuyển vào đúng thư mục web và chạy start bằng pnpm
WORKDIR /app/apps/web
CMD ["pnpm", "start"]