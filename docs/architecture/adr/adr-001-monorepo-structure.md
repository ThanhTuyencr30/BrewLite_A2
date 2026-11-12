# ADR-001: Sử dụng Kiến trúc Monorepo cho Dự án BrewLite

* **Trạng thái:** Accepted (Đã chấp thuận)
* **Ngày tạo:** 2026-11-10
* **Người thực hiện:** Cao Ngọc Thanh Tuyền

---

## 1. Bối cảnh (Context)
Hệ thống BrewLite gồm hai thành phần chính:
- **Frontend (`apps/web`):** Xây dựng bằng Next.js 16 (React framework).
- **Backend (`apps/api`):** Xây dựng bằng NestJS và PostgreSQL (Prisma ORM).

Nếu tách thành 2 Repository Git riêng biệt, nhóm sẽ gặp khó khăn trong việc đồng bộ các kiểu dữ liệu (Data Types, DTOs, Enums như `OrderStatus`, `PaymentMethod`), dẫn đến rủi ro sai lệch dữ liệu giữa Client và Server khi làm việc nhóm.

## 2. Quyết định (Decision)
Nhóm quyết định áp dụng mô hình **Monorepo** (quản lý cả Client và Server trong cùng một Git Repository) sử dụng **pnpm Workspaces** và **Turborepo**.

Cấu trúc thư mục:
```text
brewlite-assignment-2/
├── apps/
│   ├── web/         # Next.js 16 Frontend
│   └── api/         # NestJS Backend
├── packages/
│   └── types/       # Shared DTOs, Interfaces & Enums
└── docs/            # Tài liệu kiến trúc & Sơ đồ UML