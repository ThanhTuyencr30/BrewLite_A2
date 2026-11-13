FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app
COPY . .

# Biến môi trường giả lập chỉ dùng để generate prisma trong quá trình build
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewlite_db"

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @brewlite/api exec prisma generate
RUN pnpm --filter @brewlite/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Chỉ copy những file thực sự cần thiết để chạy production (giúp image nhẹ và sạch)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001

# Sửa lại đường dẫn chuẩn của NestJS Monorepo sau khi build
CMD ["node", "apps/api/dist/apps/api/src/main.js"]