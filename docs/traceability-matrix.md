# Bảng truy vết yêu cầu — BrewLite

Ma trận liên kết mã yêu cầu trong [SRS](requirements/srs.md) với use case, thiết kế, API/code và kiểm thử có trong repository. API dưới đây gồm global prefix `/api` do NestJS cấu hình.

| Mã yêu cầu | Use case / User Story | Thiết kế / Sơ đồ | Code / API | Test |
| --- | --- | --- | --- | --- |
| FR-01–FR-04 | Duyệt menu, xem tình trạng sản phẩm và lọc danh mục | `diagrams/use-case-overview.puml`; `diagrams/use-case-menu-product.puml`; `diagrams/activity-browse-menu.puml` | `GET /api/products`; `GET /api/categories` | `apps/api/src/products/products.integration.spec.ts`; `apps/api/src/categories/categories.service.spec.ts` |
| FR-05–FR-09 | Xem chi tiết, chọn size/topping/số lượng và tính giá | `diagrams/use-case-menu-product.puml`; `diagrams/activity-browse-menu.puml`; `diagrams/class-diagram.puml` | `GET /api/products/:id`; `GET /api/toppings`; pricing phía API/web | `apps/api/src/products/products.integration.spec.ts`; `apps/api/src/products/pricing.spec.ts`; `apps/api/src/products/toppings.service.spec.ts` |
| FR-10–FR-14 | Quản lý giỏ và kiểm tra lại nội dung trước khi đặt | `diagrams/use-case-cart.puml`; `diagrams/use-case-checkout.puml`; `diagrams/activity-checkout.puml` | Cart state phía web; `POST /api/cart/validate` | `apps/api/src/cart/cart.integration.spec.ts`; `apps/api/src/cart/cart.service.spec.ts` |
| FR-15–FR-19 | Đăng ký, đăng nhập, JWT và quyền truy cập dữ liệu cá nhân | `diagrams/use-case-account.puml`; `diagrams/use-case-overview.puml` | `POST /api/auth/register`; `POST /api/auth/login`; `GET /api/auth/me`; JWT guards | `apps/api/test/auth.e2e-spec.ts`; `apps/api/src/auth/auth.service.spec.ts`; `apps/api/src/auth/auth.controller.spec.ts` |
| FR-20–FR-25 | Tạo đơn, tính tổng, thanh toán và chống xử lý lặp | `diagrams/use-case-checkout.puml`; `diagrams/activity-checkout.puml`; `diagrams/sequence-checkout.puml`; `diagrams/class-diagram.puml` | `POST /api/orders`; `POST /api/payments`; `Idempotency-Key` header | `apps/api/test/checkout-flow.e2e-spec.ts`; `apps/api/src/orders/orders.service.spec.ts`; `apps/api/src/payments/payment.integration.spec.ts`; `apps/api/src/payments/payments.service.spec.ts` |
| FR-26–FR-30 | Xác nhận đơn, xem lịch sử/chi tiết và quy tắc trạng thái | `diagrams/use-case-order-tracking.puml`; `diagrams/activity-order-payment.puml`; `diagrams/class-diagram.puml` | `GET /api/orders/me`; `GET /api/orders/:id`; `POST /api/orders/:id/cancel` | `apps/api/src/orders/orders.controller.spec.ts`; `apps/api/src/orders/order-state-machine.spec.ts` |
| FR-31–FR-35 | State machine, tồn kho, khuyến mãi, loyalty và hủy đơn | `diagrams/activity-order-payment.puml`; `diagrams/activity-payment-retry.puml`; `diagrams/activity-auto-cancel-order.puml`; `architecture/adr/adr-002-state-machine-and-idempotency.md` | Orders, payments, promotions và scheduler services | `apps/api/src/orders/orders.concurrency.spec.ts`; `apps/api/src/orders/orders.scheduler.spec.ts`; `apps/api/src/promotions/promotions.service.spec.ts`; `apps/api/src/payments/payments.service.spec.ts` |
| NFR-01 | Hiệu năng API | SRS — tiêu chí NFR-01 | API NestJS | Chưa có benchmark tự động; cần ghi lại môi trường và kết quả đo khi nghiệm thu. |
| NFR-02–NFR-05, NFR-09 | Bảo vệ thông tin xác thực, validate dữ liệu, thanh toán idempotent và nhất quán dữ liệu | `diagrams/sequence-checkout.puml`; `diagrams/class-diagram.puml`; ADR-002 | DTO validation, JWT, Prisma transaction và payment services | Các auth, order, payment và concurrency tests được liệt kê ở trên. |
| NFR-06, NFR-11 | HTTPS, tách cấu hình khỏi mã nguồn, triển khai lặp lại | `architecture/deployment-production.puml`; `deployment.md` | Dockerfiles; `docker-compose.yml`; `.env.example`; GitHub Actions | Kiểm tra cấu hình/URL khi có môi trường production; hiện chưa có URL production được xác nhận. |
| NFR-07–NFR-08, NFR-10 | Tương thích giao diện, trạng thái loading/empty/error và phục hồi lỗi | `ui-component-system.md`; màn hình Next.js | `apps/web/src/app/`; `apps/web/src/components/` | Cần hoàn tất kiểm thử thủ công trên trình duyệt/điện thoại; chưa có browser-level E2E menu-to-order. |

## Ghi chú trạng thái

- Tên test là đường dẫn test hiện có; các tiêu chí hiệu năng, trình duyệt và production cần bổ sung bằng chứng thực nghiệm trước nghiệm thu.
- Các test API hiện không thay thế browser-level E2E cho toàn bộ luồng từ menu đến xác nhận đơn.
- Deployment diagram phải được cập nhật theo nền tảng production thực tế sau khi nhóm chọn nền tảng; xem [deployment checklist](deployment.md).
