# BrewLite — Assignment 2

Monorepo cho BrewLite, ứng dụng đặt đồ uống với Next.js, NestJS, PostgreSQL và Docker. Repository dùng **pnpm workspaces** làm package manager chính.

## Cấu trúc

```text
apps/
  api/                 NestJS API, Prisma schema, migrations và API tests
  web/                 Next.js mobile-first web app
packages/types/        Shared TypeScript types
docs/
  requirements/        Context, scope và SRS
  diagrams/            PlantUML models
  architecture/        Architecture, deployment diagram và ADRs
  deployment.md        Deployment/CD checklist
  product-backlog.md   Sprint 1/2 backlog and current evidence
  traceability-matrix.md
tests/                 Hướng dẫn vị trí và cách chạy test
.github/workflows/     CI và release image workflows
docker-compose.yml     Môi trường local: web, API và PostgreSQL
```

## Chạy local bằng Docker

Yêu cầu: Docker Desktop, Node.js và Corepack/pnpm.

```powershell
Copy-Item .env.example .env
```

Mở `.env`, thay các giá trị placeholder cho local. Sau đó:

```powershell
corepack enable
pnpm install --frozen-lockfile
docker compose up --build -d
docker compose exec backend pnpm --filter @brewlite/api run prisma:seed
```

Ứng dụng:

- Web: http://localhost:3000
- API: http://localhost:3001/api
- API health: http://localhost:3001/health
- Swagger: http://localhost:3001/docs

Xem log hoặc dừng dịch vụ:

```powershell
docker compose logs -f backend frontend
docker compose down
```

Database dùng named volume `db-data`; `docker compose down` không xóa dữ liệu. Không dùng các secret mẫu hoặc cấu hình sandbox trong production.

## Kiểm tra chất lượng

Chạy từ repository root:

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm test:e2e` chạy API integration/E2E tests và cần PostgreSQL đã migrate, catalog đã seed cùng biến môi trường API hợp lệ. Xem [tests/README.md](tests/README.md) để biết vị trí test và cách kiểm thử health endpoint.

Kiểm tra health endpoint đang chạy:

```powershell
$env:API_URL = "http://localhost:3001"
pnpm smoke
```

## Tài liệu yêu cầu và kiến trúc

- [SRS](docs/requirements/srs.md) và [bối cảnh/phạm vi](docs/requirements/context-and-scope.md)
- [Sơ đồ và ma trận truy vết](docs/diagrams/) · [traceability matrix](docs/traceability-matrix.md)
- [Architecture và ADRs](docs/architecture/)
- [Deployment/CD checklist](docs/deployment.md)

## CI, release và production

Pull request được kiểm tra bởi [CI quality gate](.github/workflows/ci.yml): cài dependencies, Prisma generate/migrate, lint, test và build. Khi tạo tag `v*`, [release workflow](.github/workflows/release.yml) kiểm tra lại quality gate và build/push web/API images lên GitHub Container Registry.

Để phát hành image sau khi quality gate đạt:

```powershell
git tag v1.0.0
git push origin v1.0.0
```

**Production deploy chưa được cấu hình trong repository.** Chưa có nền tảng deploy, production URLs hoặc rollback endpoint được xác nhận; workflow hiện chỉ publish image, không tạo GitHub Release và không triển khai dịch vụ. Trước khi phát hành cần hoàn thành [deployment checklist](docs/deployment.md), cấu hình GitHub Actions variable `NEXT_PUBLIC_API_URL`, chọn nền tảng production và bổ sung deploy/smoke-test/rollback thực tế.

Khi đã deploy, rollback cần dùng cặp image tag `brewlite-web:<commit-sha>` và `brewlite-api:<commit-sha>` của release ổn định trước đó; không dùng tag `latest`. Redeploy image cũ qua công cụ của nền tảng, kiểm tra tương thích migration, sau đó chạy smoke test. Nếu migration không tương thích ngược, khôi phục database theo backup/restore của nền tảng trước khi chuyển traffic. Các lệnh cụ thể phụ thuộc nền tảng và sẽ được ghi tại đây sau khi nhóm chọn nền tảng; hiện chưa có rollback production để chạy.

## Quy ước đóng góp

Xem [CONTRIBUTING.md](CONTRIBUTING.md) và [Pull Request template](.github/pull_request_template.md).
