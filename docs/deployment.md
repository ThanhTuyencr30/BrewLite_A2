# Deployment và CI/CD Checklist

Checklist này dùng để chuẩn bị phát hành BrewLite lên production và bàn giao theo yêu cầu Assignment 2. Không đánh dấu hoàn thành nếu chưa có bằng chứng như URL truy cập được, log pipeline hoặc release tương ứng.

## Tình trạng hiện tại trong repository

| Hạng mục | Tình trạng | Ghi chú |
| --- | --- | --- |
| CI quality gate | Đã cấu hình, chưa có bằng chứng run trong tài liệu | Workflow ở `.github/workflows/ci.yml` chạy lint, test và build. |
| Build và push image | Có workflow, chưa chạy xác nhận | `.github/workflows/release.yml` gọi lại quality gate, rồi build/push image lên GHCR khi có tag `v*`. Cần cấu hình GitHub Actions variable `NEXT_PUBLIC_API_URL`. |
| Deploy production | Chưa hoàn thành | Chưa chọn nền tảng production hoặc cấu hình lệnh deploy thật. |
| Smoke test production | Chưa hoàn thành | `scripts/smoke-test.mjs` kiểm tra health API, nhưng release workflow chưa gọi endpoint production sau deploy. |
| Production URL / rollback | Chưa có bằng chứng | Cần bổ sung sau khi chọn và cấu hình nền tảng production. |
| Deployment diagram | Cần cập nhật | Sơ đồ hiện mô tả Docker host; cần phản ánh nền tảng production, CI, registry, secrets và health check thực tế. |

## 1. Trước khi phát hành

- [ ] Chọn nền tảng production và ghi rõ dịch vụ chạy web, API và PostgreSQL.
- [ ] Cập nhật [deployment-production.puml](./architecture/deployment-production.puml) cho khớp nền tảng và cấu hình triển khai thực tế.
- [ ] Đảm bảo database production có persistent storage, backup/restore và không mở cổng PostgreSQL ra Internet.
- [ ] Cấu hình domain và HTTPS cho frontend, API và URL callback thanh toán.
- [ ] Cấu hình biến môi trường/secrets trực tiếp trên nền tảng hoặc GitHub Actions; không commit giá trị thật:
  - `DATABASE_URL`, `JWT_SECRET`, `ADMIN_API_KEY`
  - `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`
  - `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL`, `VNPAY_RETURN_URL`
  - Các biến SMTP nếu bật chức năng email.
- [ ] Xác nhận `NEXT_PUBLIC_API_URL` được truyền ở thời điểm build frontend và trỏ tới API HTTPS production.
- [ ] Xác nhận callback VNPay dùng URL HTTPS công khai và cấu hình sandbox/production đúng môi trường.
- [ ] Kiểm tra health check và log không chứa secret, token, thông tin thanh toán nhạy cảm.

## 2. CI và tạo release image

- [x] Đặt CI và release workflows tại `.github/workflows/` ở root repository để GitHub Actions nhận diện.
- [x] Đặt release image job phụ thuộc vào quality gate lint, test và build thành công.
- [ ] Tạo tag release có phiên bản, ví dụ `v1.0.0`; ghi commit SHA tương ứng.
- [x] Định nghĩa build image web/API và push lên GHCR với tag commit SHA và tag release.
- [ ] Kiểm tra image đã được push và có thể tải về bằng nền tảng deploy.
- [ ] Cấu hình branch protection cho `main`/`develop`, đặt quality gate làm required status check và chặn merge khi check thất bại.

## 3. Deploy và kiểm tra sau deploy

- [ ] Bổ sung lệnh/API deploy thật theo nền tảng đã chọn, dùng secret của CI.
- [ ] Chạy Prisma migration theo quy trình an toàn trước khi chuyển traffic; xác nhận migration tương thích với phiên bản đang chạy.
- [ ] Chờ dịch vụ khởi động và kiểm tra `GET https://<api-domain>/health` trả HTTP 200.
- [ ] Kiểm tra frontend production truy cập được qua HTTPS.
- [ ] Chạy smoke test tối thiểu cho API catalog, đăng nhập và luồng tạo đơn/thanh toán phù hợp với môi trường.
- [ ] Cấu hình pipeline thất bại nếu deploy hoặc bất kỳ smoke test nào không thành công.
- [ ] Kiểm tra log triển khai và xác nhận database production không truy cập công khai.

## 4. Rollback và bàn giao

- [ ] Ghi lại image tag đang chạy trước mỗi lần deploy.
- [ ] Thực hiện thử quy trình rollback về image tag ổn định trước đó.
- [ ] Có backup/restore database và hướng xử lý migration không tương thích; không dựa vào rollback image để đảo ngược thay đổi dữ liệu.
- [ ] Tạo GitHub Release/tag và release notes nêu thay đổi, migration và lưu ý vận hành.
- [ ] Cập nhật README với hướng dẫn chạy local, test, build, deploy và rollback.
- [ ] Ghi URL frontend production, URL API và health check tại README hoặc release notes.
- [ ] Đính kèm bằng chứng CI/CD thành công, demo luồng end-to-end, Sprint Review và Sprint Retrospective.
- [ ] Lưu liên kết/log một lần CI thành công và một lần CI phát hiện lỗi; không tạo log giả lập.
- [ ] Cung cấp Product Backlog/Sprint board và quyền truy cập repository cho người nghiệm thu.

## Điều kiện hoàn tất

Chỉ coi deployment/CD hoàn tất khi pipeline thực sự build và push image, deploy được lên nền tảng production, smoke test kiểm tra endpoint thật, có hướng rollback đã xác minh và các URL bàn giao truy cập được qua HTTPS.
