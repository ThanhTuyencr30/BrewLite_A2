FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app
COPY . .

# Khai báo DATABASE_URL giả lập phòng trường hợp postinstall của monorepo kích hoạt
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewlite_db"

RUN pnpm install --frozen-lockfile
RUN pnpm --filter web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]