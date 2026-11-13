FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app
COPY . .

# Khai báo DATABASE_URL giả lập phòng trường hợp postinstall của monorepo kích hoạt
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewlite_db"

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @brewlite/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Chỉ copy những file cần thiết để chạy Next.js production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next

EXPOSE 3000

# Chuyển vào đúng thư mục web và chạy start bằng pnpm
WORKDIR /app/apps/web
CMD ["pnpm", "start"]