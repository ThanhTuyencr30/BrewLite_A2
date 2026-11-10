1. Bối cảnh nghiệp vụ
BrewLite là ứng dụng web hỗ trợ khách hàng xem menu, lựa chọn đồ uống, tùy chỉnh size và topping, quản lý giỏ hàng, đặt hàng và thanh toán không dùng tiền mặt. Sản phẩm hướng đến việc giảm sự phụ thuộc vào tiền mặt, đơn giản hóa quy trình đặt hàng, giảm thời gian chờ tại quầy và hạn chế sai sót khi tạo đơn, tính tiền và thanh toán.
Trong phạm vi MVP, hệ thống tập trung vào trải nghiệm của khách hàng. Các chức năng dành cho nhân viên quầy/barista và quản lý cửa hàng như tiếp nhận đơn, cập nhật trạng thái pha chế và quản trị menu được xem là phần mở rộng, chưa triển khai.
2. Mục tiêu nghiệp vụ
-Cho phép khách hàng xem menu và thông tin đồ uống trực tuyến.
-Hỗ trợ tùy chỉnh size, topping, số lượng và quản lý giỏ hàng.
-Cho phép khách hàng đăng ký, đăng nhập, tạo đơn và thanh toán không tiền mặt.
-Cung cấp thông tin xác nhận, trạng thái và lịch sử đơn hàng.
-Hỗ trợ mã giảm giá và điểm thưởng theo phạm vi nghiệp vụ nâng cao được mô tả trong yêu cầu.
-Đảm bảo tính chính xác của đơn hàng và thanh toán: không ghi nhận thanh toán trùng, không bán vượt tồn kho.
3. Stakeholder
| STT | Stakeholder | Vai trò và nhu cầu | Mức độ quan tâm/ảnh hưởng |
| :---: | :--- | :--- | :--- |
| 1 | Khách hàng | Xem menu, chọn đồ uống, size, topping; đặt hàng; thanh toán không tiền mặt; theo dõi đơn và xem lịch sử. | Cao |
| 2 | Barista (nhân viên quầy) | Tiếp nhận đơn và cập nhật trạng thái pha chế. Chức năng thuộc phần mở rộng, ngoài MVP. | Trung bình trong MVP; cao khi mở rộng |
| 3 | Quản lý cửa hàng / Product Owner (PO) | Xác định yêu cầu, ưu tiên Product Backlog và nghiệm thu Increment sau mỗi Sprint. Menu MVP sử dụng dữ liệu mẫu, chưa có quản trị menu. | Cao |
| 4 | Giảng viên nghiệm thu | Đánh giá quy trình, sản phẩm và mức độ đáp ứng tiêu chí chấp nhận của bài tập lớn. | Cao về đánh giá |
| 5 | Nhóm phát triển | Phân tích, thiết kế giao diện, CSDL, API; lập trình, kiểm thử và bàn giao hệ thống. | Cao |
| 6 | Đơn vị thanh toán | Cung cấp hoặc được mô phỏng qua dịch vụ thanh toán Ví/Thẻ trong phạm vi bài tập lớn. | Cao về chuyên môn |

4. Phạm vi sản phẩm
4.1. In-scope – Phạm vi MVP
1.Hiển thị danh sách đồ uống và thông tin sản phẩm.
2.Lọc đồ uống theo danh mục.
3.Xem chi tiết đồ uống.
4.Chọn size S, M, L; chọn topping và số lượng.
5.Thêm, cập nhật và xóa sản phẩm trong giỏ hàng.
6.Đăng ký, đăng nhập và xác thực bằng JWT.
7.Kiểm tra lại sản phẩm, giá và số lượng trước khi đặt.
8.Tạo đơn hàng ở trạng thái PENDING.
9.Thanh toán giả lập qua Ví điện tử hoặc Thẻ ngân hàng.
10.Ghi nhận kết quả thanh toán; chuyển đơn sang PAID hoặc PAYMENT_FAILED.
11.Hiển thị xác nhận đơn và cho phép khách hàng xem lịch sử/chi tiết đơn của chính mình.
4.2. Phạm vi nghiệp vụ nâng cao
Các nghiệp vụ sau được mô tả trong yêu cầu của sản phẩm và được xác định là phần nâng cao (Task 10): máy trạng thái đơn hàng; idempotency bằng Idempotency-Key; kiểm soát tồn kho khi đặt đồng thời; mã giảm giá; điểm thưởng; xử lý hủy đơn và hoàn lại các giá trị liên quan.
4.3. Out-of-scope – Ngoài phạm vi MVP
-Chức năng barista tiếp nhận đơn và cập nhật trạng thái pha chế.
-Trang quản trị menu.
-Đổi điểm lấy ưu đãi và phân hạng khách hàng.
-Voucher phức tạp, khuyến mãi tự động.
-Tích hợp cổng thanh toán thật, QR chuyển khoản và đối soát giao dịch.
-Tự động hoàn tiền và xử lý khiếu nại giao dịch.
-Dự báo doanh thu, phân tích dữ liệu.
5. Giả định
Các giả định dưới đây được sử dụng để giới hạn và làm rõ phạm vi thực hiện:
-Menu, danh mục, giá, size, topping và dữ liệu tồn kho ban đầu được cung cấp bằng dữ liệu mẫu/seed do nhóm chuẩn bị.
-Khách hàng có thiết bị truy cập web và kết nối Internet để sử dụng ứng dụng.
-Khách hàng phải đăng nhập trước khi tạo đơn và sử dụng chức năng lịch sử đơn hàng.
-Thanh toán trong bài tập lớn sử dụng dịch vụ giả lập Ví/Thẻ, không phải giao dịch tiền thật (dịch vụ thanh toán hỗ trợ hai cơ chế: (1) Mock Payment Service nội bộ (mô phỏng Ví/Thẻ) và (2) Môi trường thử nghiệm Sandbox của Cổng VNPay).
-Dịch vụ thanh toán giả lập trả về kết quả thành công hoặc thất bại để backend xử lý.
-Quy trình pha chế thực tế tại quầy không nằm trong MVP; các trạng thái pha chế được mô tả để thống nhất mô hình nghiệp vụ và có thể thuộc phần mở rộng.
6. Ràng buộc
-Frontend sử dụng Next.js theo hướng mobile-first/PWA.
-Backend sử dụng NestJS.
-Dữ liệu được lưu trong PostgreSQL.
-Hệ thống phải được tổ chức để chạy bằng Docker theo yêu cầu Assignment 2.
-Mật khẩu không được lưu dạng văn bản thuần; sử dụng cơ chế băm phù hợp.
-Các API cần đăng nhập phải kiểm tra JWT và giới hạn dữ liệu theo tài khoản.
-Backend phải tự kiểm tra dữ liệu và tính lại giá, không tin giá do frontend gửi lên.
-Chỉ ghi nhận thanh toán thành công khi backend nhận được kết quả hợp lệ từ dịch vụ thanh toán.
-Các sơ đồ, yêu cầu và mã nguồn phải được quản lý phiên bản trong repository của nhóm.
7. Rủi ro ban đầu
| Mã | Rủi ro | Ảnh hưởng | Hướng giảm thiểu |
| :---: | :--- | :--- | :--- |
| R-01 | Dữ liệu giá/tồn kho thay đổi trong lúc khách đặt hàng | Đơn sai giá hoặc bán vượt tồn kho | Backend kiểm tra lại giá, trạng thái và số lượng trước khi tạo đơn; dùng transaction khi cập nhật dữ liệu liên quan. |
| R-02 | Client gửi lặp yêu cầu thanh toán | Có thể ghi nhận giao dịch trùng | Dùng Idempotency-Key, lưu và kiểm tra kết quả xử lý của yêu cầu. |
| R-03 | Dịch vụ thanh toán giả lập trả kết quả thất bại hoặc chậm | Khách không hoàn tất được thanh toán | Có trạng thái thất bại rõ ràng, giữ thông tin giỏ/đơn để khách thử lại theo quy trình. |
| R-04 | Truy cập trái phép lịch sử đơn của người khác | Lộ dữ liệu cá nhân/đơn hàng | Lấy user ID từ JWT, kiểm tra quyền sở hữu ở backend. |
| R-05 | Yêu cầu và sơ đồ không thống nhất với CSDL/API | Phát sinh lỗi tích hợp, khó kiểm thử | Duy trì mã FR/NFR, Use Case và ma trận truy vết; cập nhật tài liệu cùng thay đổi mã nguồn. |
| R-06 | Phạm vi phát triển vượt quá thời gian bài tập | Không hoàn thành MVP | Ưu tiên chức năng Must; giữ các chức năng mở rộng ngoài MVP. |

8. Kết luận
Task 1.1 xác định BrewLite là ứng dụng web đặt cà phê và thanh toán không tiền mặt, tập trung vào khách hàng trong MVP. Bảng stakeholder, phạm vi, giả định, ràng buộc và rủi ro là cơ sở để xây dựng SRS, mô hình hóa hệ thống và lập kế hoạch triển khai.