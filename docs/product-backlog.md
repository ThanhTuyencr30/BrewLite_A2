# Product Backlog — BrewLite Assignment 2

Backlog tham chiếu các task trong đề bài. Trạng thái dưới đây phản ánh tạo phẩm đang có trong repository; không thay thế GitHub Issues/Projects hoặc bằng chứng nghiệm thu.

| ID | Sprint / Task | Work item | Trạng thái | Tạo phẩm / Bằng chứng |
| --- | --- | --- | --- | --- |
| BL-01 | Sprint 1 / Task 1 | Xác định stakeholder, phạm vi, yêu cầu và use case trọng tâm | Done | [Context and scope](requirements/context-and-scope.md), [SRS](requirements/srs.md) |
| BL-02 | Sprint 1 / Task 2 | Tạo use-case, activity, sequence, class và ERD; kết xuất SVG | Done | [Diagrams](diagrams/) |
| BL-03 | Sprint 1 / Task 3 | Ghi quyết định kiến trúc và deployment model | Partial | [Architecture](architecture/); cần chốt nền tảng production để hoàn thiện deployment diagram |
| BL-04 | Sprint 1 / Task 4.1–4.2 | Thiết lập monorepo, quy ước PR và quản lý tài liệu | Partial | [CONTRIBUTING](../CONTRIBUTING.md), PR template, docs; GitHub backlog/branch protection và lịch sử PR cần xác nhận |
| BL-05 | Sprint 1 / Task 4.3 | Hiện thực API và giao diện menu với trạng thái cơ bản | Done | `apps/api/src/products/`, `apps/web/src/` |
| BL-06 | Sprint 1 / Task 4.4 | Tự động chạy lint, test và build cho PR | Partial | [CI workflow](../.github/workflows/ci.yml); cần branch protection và bằng chứng run thành công/thất bại |
| BL-07 | Sprint 2 / Task 5.1 | Hoàn thiện sản phẩm, giỏ hàng, xác thực, đặt hàng và thanh toán | Done | `apps/web/src/`, `apps/api/src/` |
| BL-08 | Sprint 2 / Task 5.2 | Migration/seed, Docker Compose, health check và kiểm thử tích hợp/E2E | Partial | [docker-compose.yml](../docker-compose.yml), migrations, [tests](../tests/); browser E2E chưa có |
| BL-09 | Sprint 2 / Task 5.3 | Publish images, deploy production, smoke test và rollback | Partial | [Release workflow](../.github/workflows/release.yml) publish GHCR images; deploy/smoke/rollback production chưa cấu hình |
| BL-10 | Sprint 2 / Task 5.4 | Bàn giao production, release notes, demo và retrospective | Pending | Cần production URLs, GitHub Release, demo và Sprint Review/Retrospective |

## Theo dõi ngoài repository

- Tạo GitHub Project/Issue Board cho Sprint 1 và Sprint 2, liên kết mỗi issue với ID backlog và pull request tương ứng.
- Cấp quyền repository cho giảng viên/khách hàng nghiệm thu.
- Chỉ đổi trạng thái backlog khi có bằng chứng tương ứng; không đánh dấu hoàn tất production khi chưa truy cập được URL thật.
