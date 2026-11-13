## Tóm tắt thay đổi
<!-- Mô tả ngắn gọn những thay đổi trong PR này -->

## Liên kết Task / Gói nghiệp vụ
<!-- Ví dụ: Gói 1 - Task 4.3, Task 5.2 -->

## Quy tắc nhánh & Pull Request (PR Rules)
- Nhánh phát triển tuân theo quy ước: `feature/<ten-tinh-nang>`, `fix/<ten-loi>`, `docs/<tai-lieu>`, `chore/<cau-hinh>`.
- PR nhắm vào `develop` hoặc `main` (không push trực tiếp code chưa review lên `main`).
- Không chứa thông tin nhạy cảm (`JWT_SECRET`, `DATABASE_URL` thật, API keys).

## Definition of Done (DoD)
- [ ] Code tuân thủ quy chuẩn lint (`pnpm lint` pass cho cả `apps/api` và `apps/web`).
- [ ] Unit Test & Integration Test chạy thành công (`pnpm test` và `pnpm test:e2e`).
- [ ] Build thành công (`pnpm build`).
- [ ] Đã kiểm tra giao diện mobile-first & xử lý đầy đủ trạng thái loading/empty/error (nếu có UI).
- [ ] Tài liệu / `docs/traceability-matrix.md` đã được cập nhật tương ứng (nếu có thay đổi nghiệp vụ).

