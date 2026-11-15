# Danh mục tài liệu BrewLite

Tài liệu Assignment 2 được lưu và quản lý phiên bản trong `docs/`.

## Yêu cầu

- [`requirements/context-and-scope.md`](requirements/context-and-scope.md) — bối cảnh nghiệp vụ, stakeholder, phạm vi, giả định, ràng buộc và rủi ro.
- [`requirements/srs.md`](requirements/srs.md) — yêu cầu chức năng/phi chức năng, tiêu chí chấp nhận và use case trọng tâm.
- [`traceability-matrix.md`](traceability-matrix.md) — truy vết yêu cầu tới use case, thiết kế, API/code và test.
- [`product-backlog.md`](product-backlog.md) — backlog theo Sprint/Task của Assignment 2 và tình trạng tạo phẩm trong repository.

## Mô hình hóa

- [`diagrams/`](diagrams/) — mã PlantUML và bản SVG được kết xuất của các sơ đồ use case, activity, sequence, class và ERD.

Khi sửa sơ đồ, cập nhật `.puml` trước rồi kết xuất lại `.svg` từ cùng nguồn.

## Kiến trúc và triển khai

- [`architecture/system-architecture.puml`](architecture/system-architecture.puml) — sơ đồ kiến trúc hệ thống.
- [`architecture/deployment-production.puml`](architecture/deployment-production.puml) — deployment diagram; phải được cập nhật theo nền tảng production thực tế.
- [`architecture/adr/`](architecture/adr/) — quyết định kiến trúc.
- [`deployment.md`](deployment.md) — checklist production, CI/CD, smoke test, rollback và bàn giao.

## Giao diện

- [`ui-component-system.md`](ui-component-system.md) — quy ước component giao diện dùng chung.

Mọi thay đổi yêu cầu, sơ đồ hoặc kiến trúc cần được giải thích trong pull request và giữ đồng bộ với code/test liên quan.
