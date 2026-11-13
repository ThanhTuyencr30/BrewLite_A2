# Hướng Dẫn Đóng Góp & Quy Trình Phát Triển – BrewLite Monorepo

Tài liệu này quy định cấu trúc Monorepo, quy ước nhánh (Branching), quy tắc Pull Request và **Definition of Done (DoD)** cho nhóm phát triển BrewLite (Assignment 2).

## 1. Cấu Trúc Monorepo

Dự án sử dụng **pnpm Workspaces**:

```text
BrewLite_A2/
├── .github/
│   ├── workflows/ci.yml          # CI Pipeline & Quality Gate (Install -> Lint -> Test -> Build)
│   └── pull_request_template.md  # Mẫu Pull Request chuẩn
├── apps/
│   ├── api/                      # NestJS Backend + Prisma ORM (@brewlite/api)
│   └── web/                      # Next.js Frontend (@brewlite/web)
├── packages/
│   └── types/                    # Shared Types / Interfaces (@brewlite/types)
├── docs/                         # SRS, ADR, UML Diagrams & Traceability Matrix
└── scripts/                      # Tiện ích kiểm tra hệ thống (smoke-test.mjs)
```

## 2. Quy Ước Nhánh (Branching Strategy)

* `main`: Nhánh ổn định nhất, luôn sẵn sàng phát hành/demo. Chỉ nhận code thông qua Pull Request đã vượt qua Quality Gate.
* `develop`: Nhánh tích hợp các tính năng của từng Sprint trước khi gộp vào `main`.
* `feature/<ten-tinh-nang>`: Nhánh phát triển tính năng mới (ví dụ: `feature/menu-search`, `feature/mock-payment`).
* `fix/<ten-loi>`: Nhánh sửa lỗi.
* `docs/<mo-ta>` / `chore/<mo-ta>`: Nhánh cập nhật tài liệu hoặc cấu hình hạ tầng.

## 3. Quy Tắc Pull Request (PR Rules)

1. Mỗi PR chỉ tập trung vào một nhiệm vụ/gói công việc rõ ràng và điền đầy đủ `.github/pull_request_template.md`.
2. Không commit tệp `.env` hoặc secrets (chỉ cập nhật `.env.example` khi có biến môi trường mới).
3. Mọi PR nhắm vào `main` hoặc `develop` bắt buộc phải pass workflow **CI Quality Gate** trên GitHub Actions:
   * `Install` (`pnpm install --frozen-lockfile`)
   * `Prisma Generate`
   * `Lint` (`@brewlite/api` và `@brewlite/web`)
   * `Unit & Integration Tests` (`test` & `test:e2e`)
   * `Build` (`@brewlite/api` và `@brewlite/web`)

## 4. Definition of Done (DoD)

Một tính năng chỉ được coi là hoàn thành khi đáp ứng đủ các tiêu chí sau:

1. **Chức năng đúng đặc tả:** Đáp ứng đầy đủ Acceptance Criteria trong `docs/requirements/srs.md`.
2. **Code sạch & không lỗi Lint:** Không còn lỗi `oxlint` (Backend) hay `eslint` (Frontend).
3. **Kiểm thử đầy đủ:** Có Unit Test / Integration Test cho logic nghiệp vụ mới và toàn bộ bộ test hiện có đều pass.
4. **Build thành công:** Lệnh `pnpm build` chạy thành công trên cả Frontend và Backend.
5. **Tài liệu đồng bộ:** Cập nhật `docs/traceability-matrix.md` hoặc tài liệu liên quan nếu có thay đổi API/UI.

