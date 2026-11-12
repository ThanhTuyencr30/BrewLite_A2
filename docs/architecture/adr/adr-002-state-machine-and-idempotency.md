# ADR-002: Áp dụng Order State Machine, Idempotency-Key và Optimistic Locking

* **Trạng thái:** Accepted (Đã chấp thuận)
* **Ngày tạo:** 2026-11-10
* **Người thực hiện:** Cao Ngọc Thanh Tuyền

---

## 1. Bối cảnh (Context)
Nghiệp vụ Đặt hàng & Thanh toán nước uống có các thách thức kỹ thuật nguy hiểm:
1. **Trạng thái đơn hàng bị nhảy cóc:** Đơn vừa tạo (`PENDING`) chưa trả tiền đã nhảy sang `COMPLETED`.
2. **Thanh toán trùng (Double Payment):** Khách bấm nút "Thanh toán" 2-3 lần liên tiếp do mạng lag, hoặc cổng thanh toán (VNPAY) gửi Webhook Callback lặp lại nhiều lần.
3. **Hết hàng cùng lúc (Race Condition):** 2 khách hàng cùng đặt ly cà phê cuối cùng tại một thời điểm.

## 2. Quyết định (Decision)
Nhóm áp dụng bộ 3 giải pháp kiến trúc Backend:

1. **Order State Machine (`OrderStateMachine` service):**
   - Chỉ cho phép chuyển trạng thái theo đúng luồng: `PENDING` $\rightarrow$ `PAID` / `PAYMENT_FAILED` / `CANCELLED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`.
   - Mọi nỗ lực chuyển trạng thái trái phép sẽ ném ngoại lệ `BadRequestException`.

2. **Idempotency-Key (Khoá chống lặp thanh toán):**
   - Mỗi giao dịch thanh toán gửi lên Backend bắt buộc kèm một chuỗi UUID duy nhất (`idempotencyKey`).
   - Nếu Backend nhận lại `idempotencyKey` đã xử lý thành công trước đó, nó sẽ trả về ngay kết quả cũ mà không trừ lại tiền hay tạo lại transaction.

3. **Optimistic Locking (Khóa lạc quan):**
   - Thêm cột `version: Int` vào bảng `Product` và `Topping`.
   - Khi trừ kho: `UPDATE Product SET stock = stock - 1, version = version + 1 WHERE id = :id AND version = :currentVersion`.

## 3. Hệ quả & Lợi ích (Consequences)

### Ưu điểm (Lý do bảo vệ trước Giảng viên):
1. **Đảm bảo tính toàn vẹn dữ liệu:** Không bao giờ bị trừ tiền 2 lần hoặc đơn hàng bị đổi trạng thái sai logic.
2. **Hiệu năng cao:** Optimistic Locking không gây khóa cứng bảng (DB deadlock/blocking) như Pessimistic Locking (`SELECT FOR UPDATE`), rất phù hợp ứng dụng đặt đồ uống lưu lượng vừa & lớn.
